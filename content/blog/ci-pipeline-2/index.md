---
title: Simple CI pipeline - Part 2 - Configuration
author: Bradley Morris
date: '2019-01-22T22:40:32.169Z'
---

## Welcome back

In part 1 of this tutorial we went through setting up a Digital ocean droplet, Docker hub , github repo and a Circle CI account to connect and get our latest code changes from repo and access our digital ocean droplet.

In this tutorial we will continue from that starting point and configure our Circle ci **workflow** to pull our latest changes, build our project , test it and deploy it via a docker image to our Digital Ocean droplet.

Let's get started!

## Circle CI config

We created a .circleci/config.yml file in our setup step. This time around we will edit this file to create a **workflow** that will do everything we need automatically everytime we push a code change to our repo.

What is a workflow? A workflow is the step-by-step process that Cicle CI follows to do the things we want.
The workflow is setup in our config.yml file and uses a series of **jobs** defined in our config.yml file as well.

Our workflow will look like the following when we are done:

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
