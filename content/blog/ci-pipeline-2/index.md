---
title: Simple CI pipeline - Part 2 - Configuration
author: Bradley Morris
date: '2019-01-22T22:40:32.169Z'
---

## Welcome back

In part 1 of this tutorial we went through setting up a Digital ocean droplet, Docker hub , github repo and a Circle CI account to connect and get our latest code changes from repo and access our digital ocean droplet.

In this tutorial we will continue from that starting point and configure our Circle ci **workflow** to pull our latest changes, build our project , test it and deploy it via a docker image to our Digital Ocean droplet.

Before we get started configuring, you'll need to make sure that the repo you used for the setup contains the following files:

- .circleci/config.yml
- Dockerfile
- package.json, with a "test" script defined.

If you don't then you can fork and clone this repository which contains the basic structure and empty files needed.

[simple-ci-pipeline](https://github.com/oldtimerza/simple-ci-pipeline)

Get yourself a cup of tea because this is quite a length explanation.

Let's get started!

## Circle CI config

When we push code changes to our repo, Circle CI will get a notification that something has changed and that it needs to run it's process.

First Circle CI pulls our latest code and then looks for a **.circleci** folder and a **config.yml** in it.
It uses this config file to determine how it should run it's deployment process.

We created a **.circleci/config.yml** file in our setup step. This time around we will edit this file to create a **workflow** that will do everything we need automatically everytime we push a code change to our repo.

The **workflows** are an ordered series of **jobs** defined in our config.yml file to achieve our deployment process.
The **jobs** define the **steps** our process takes.

> workflows order our jobs and jobs are a named collection of steps.

Our **config.yml** will look like the following when we are done:

```yaml
version: 2
jobs:
  build:
    docker:
      - image: circleci/node:8
    environment:
      NODE_ENV: 'test'
    steps:
      - checkout
      - restore_cache:
          key: dependency-cache-{{ checksum "package.json" }}
      - run:
          name: Install Dependencies
          command: yarn install --production=false
      - save_cache:
          key: dependency-cache-{{ checksum "package.json" }}
          paths:
            - ./node_modules
      - run:
          name: Test
          command: yarn test
  deploy:
    docker:
      - image: circleci/node:7
    steps:
      - checkout
      - setup_remote_docker
      - run:
          name: Deploy image to Docker Hub
          command: |
            docker build --build-arg DOCKER_USER=$DOCKER_USER --build-arg DOCKER_PASSWORD=$DOCKER_PASSWORD -t oldtimerza/blade-express .
            docker login -u $DOCKER_USER -p $DOCKER_PASSWORD
            docker push oldtimerza/blade-express
      - run:
          name: Run docker image on Digital Ocean Droplet
          command: |
            ssh $SSH_USER@$SSH_HOST -o StrictHostKeyChecking=no 'docker stop app && docker rm $(docker ps -a -q) && docker rmi $(docker images -q) && docker pull oldtimerza/blade-express && docker run -d -t -p 80:3000 --name app oldtimerza/blade-express'

workflows:
  version: 2
  build-deploy:
    jobs:
      - build
      - deploy:
          requires:
            - build
          filters:
            branches:
              only: master
```

Let's break it down.

### Breakdown

#### Version

```yaml
version: 2
```

The **version** tag you see at the top is just there to tell Circle CI which version of it's config format it needs to expect to understand what is to follow.
In our case it is version 2.

#### Jobs

We have two jobs defined in our config file: **build** and **deploy**.

##### Build

```yaml
build:
  docker:
    - image: circleci/node:8
  environment:
    NODE_ENV: 'test'
  steps:
    - checkout
    - restore_cache:
        key: dependency-cache-{{ checksum "package.json" }}
    - run:
        name: Install Dependencies
        command: yarn install --production=false
    - save_cache:
        key: dependency-cache-{{ checksum "package.json" }}
        paths:
          - ./node_modules
    - run:
        name: Test
        command: yarn test
```

In order for Circle CI to build and test our code it needs some kind of environment to do so.

How we're doing it is to tell Circle CI to create an environment from a docker image with the right environment installed that we need to run our building and testing.
That is precisely what this section does:

> We use the Docker image created and maintained by the circleci team called circleci/node:8.
> This Docker container will have node version 8.x installed as well as yarn and some other useful stuff.

```yaml
docker:
  - image: circleci/node:8
```

Next we setup some environment variables that our new container should have access to. We set our **NODE_ENV** variable to test.
We do this so that our Node process knows to run in test mode.

```yaml
environment:
  NODE_ENV: 'test'
```

Next we define the steps (the sequences of things to do) once Circle CI has created this environment and running inside it.

The first **step** in our **job** is **checkout**. This is a specific step that Circle CI picks up. It tells Circle CI to pull the latest code from our connected repo and switch to it's master branch.

```yaml
steps:
  - checkout
```

We have a weird **step** next. The **restore_cache** step.

```yaml
- restore_cache:
    key: dependency-cache-{{ checksum "package.json" }}
```

This saves us time each subsquent build. Instead of Circle CI downloading and installing all our npm packages each time we build, we instead store our **node_modules** contents in a cache that Circle CI restores.
We use the checksum of our **package.json** file as the key for the cache entry so that if the **package.json** contents change(i.e. we add a new package) the cache hit will miss and our **node_modules** content will not be restored and the packages(with the new additions) will be re-installed.

After that we define our first custom **step**. This **step** is a **run** step. A **run** step is a step that is a command for Circle CI to run in the terminal inside the build environment.

```yaml
- run:
    name: Install Dependencies
    command: yarn install --production=false
```

**run** steps have a **name** and a **command**.
The **name** is just a descriptor that Circle CI will use to display the console output of our **command** execution in a nice format on the dashboard.
The **command** part is the actual text that Circle CI will enter into the terminal and execute.

In this case our **run** step is called **Install Dependencies** and it executes the **yarn install --production=false** command in the terminal.
This step will essentially start a yarn installation process using our **package.json** file for our project.

We again have a weird caching step.

```yaml
- save_cache:
    key: dependency-cache-{{ checksum "package.json" }}
    paths:
      - ./node_modules
```

You guessed it! This simply tells Circle CI to cache the contents of our **node_modules** content under a key made up of **dependency-cache-** and the checksum of our **package.json** file.

This is so next time we run this build process we will have those contents ready at hand and not have to re-download and install them.

Finally we run another **run** step.

```yaml
- run:
    name: Test
    command: yarn test
```

This run step is quite obvious. It tells Circle CI to run our **test** script that we may have in our package.json.
If the tests fail they will exit the process and Circle CI will fail our build automatically. MAGIC!

##### Deploy

```yaml
deploy:
  docker:
    - image: circleci/node:7
  steps:
    - checkout
    - setup_remote_docker
    - run:
        name: Deploy image to Docker Hub
        command: |
          docker build --build-arg DOCKER_USER=$DOCKER_USER --build-arg DOCKER_PASSWORD=$DOCKER_PASSWORD -t oldtimerza/blade-express .
          docker login -u $DOCKER_USER -p $DOCKER_PASSWORD
          docker push oldtimerza/blade-express
    - run:
        name: Run docker image on Digital Ocean Droplet
        command: |
          ssh $SSH_USER@$SSH_HOST -o StrictHostKeyChecking=no 'docker stop app && docker rm $(docker ps -a -q) && docker rmi $(docker images -q) && docker pull oldtimerza/blade-express && docker run -d -t -p 80:3000 --name app oldtimerza/blade-express'
```

Similarly to the **build** job we did above we define the environment that wil be used to run these steps inside.

In this case we use **circleci/node:7**. (I don't it's important that it is a different version of node, but it's good to show that different environments can be used per job).

Again we use the **checkout** step to get our latest code into this environment.

```yaml
- setup_remote_docker
```

The **setup \_remote \_docker** step is another pre-defined step specific to Circle CI.

This step creates a new docker container environment for us to setup our Docker image inside.

The reason we need this is because the environment that Circle CI is currently running our commands in is a Docker container.

This is a problem because Docker does not allow building docker images from inside a container.

So we tell Circle CI that we are going to run some docker build commands and that it needs to do this outside of this current container.

> building/pushing images and running containers happens in the remote Docker Engine.
> More [here](https://discuss.circleci.com/t/confused-about-what-setup-remote-docker-really-does/11469)

```yaml
- run:
    name: Deploy image to Docker Hub
    command: |
      docker build --build-arg DOCKER_USER=$DOCKER_USER --build-arg DOCKER_PASSWORD=$DOCKER_PASSWORD -t oldtimerza/blade-express .
      docker login -u $DOCKER_USER -p $DOCKER_PASSWORD
      docker push oldtimerza/blade-express
```

As the name of this next step implies, we are going to build our Docker image and deploy it to our **DockerHub**.

The \$TEXT are environment variables. We can set these environment vairables from our Circle CI dashboard and we'll go through that part in a bit.

For now just remember that \$TEXT are environment variables in our build environment.

> \$ENV_VARIABLE are Circle CI's environment variables setup for use in this build environment from the dashboard.

What this command does in order.

```yaml
docker build --build-arg DOCKER_USER=$DOCKER_USER --build-arg DOCKER_PASSWORD=$DOCKER_PASSWORD -t oldtimerza/blade-express .
```

run docker build command, this tells docker to build our image using the config in our Dockerfile. (we will handle that later).
**--build-arg DOCKER_USER = \$DOCKER_USER** is a way to set variables that our Dockerfile needs to execute with.

In this instance we set our docker **DOCKER_USER** argument to be the environment variable that Circle CI provided.

We do the same for the password.

**-t oldtimerza/blade-express** is the tag(the name) of our docker image.

The **.**(dot) at the end is the path that Docker looks for stuff in, dot simply means this current directory.

```yaml
docker login -u $DOCKER_USER -p $DOCKER_PASSWORD
```

Next we log into our DockerHub account with the username and password provided by Circle CI environment variables.

```yaml
docker push oldtimerza/blade-express
```

Finally we push this image to our DockerHub project repo. (named oldtimerza/blade-express in this example, but yours will be different from the setup stage)

```yaml
- run:
    name: Run docker image on Digital Ocean Droplet
    command: |
      ssh $SSH_USER@$SSH_HOST -o StrictHostKeyChecking=no 'docker stop app && docker rm $(docker ps -a -q) && docker rmi $(docker images -q) && docker pull oldtimerza/blade-express && docker run -d -t -p 80:3000 --name app oldtimerza/blade-express'
```

> Note: the ' marks are important because we need all the docker commands to be run inside the SSH shell. Also take note of the $SSH_USER and $SSH_HOST environment variables that we'll need to configure from Circle CI's dashboard.

This final step of the process will SSH into our Digital Ocean droplet, stop any currently running docker containers, remove any out-dated images and pull our latest image from our DockerHub into the droplet.

Then (while still SSH'ed in) we tell docker (on the droplet) to run our new image.

```yaml
-p 80:3000 --name app oldtimerza/blade-express'
```

**-p 80:3000** tells Docker to connect the running containers port 3000 to the external hosts port 80.

We do this because our node process will be running on port 3000 but we want that to be accessed from port 80 (i.e. from the web).

**--name app** tells docker to call this running container "app" so that we can easily identify it should we need to.

**oldtimerza/blade-express** is the name of the image that docker should initialise a container with.

The Last stage of our journey will be to configure our **Dockerfile** so that Docker knows what to include in ,and how to create, our image.

## Dockerfile config
