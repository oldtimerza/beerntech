---
title: Simple CI pipeline
date: '2019-01-19T22:40:32.169Z'
---

##Introduction

One of the best ways to get a project up and running and making it easy to have the project be live and testable as soon as possible
is to start development with a **Continuous Integration(CI)** pipeline.

**Continuous Integration**,from here on referred to as **CI**, is the process of having an automated process compile, test and deploy the project whenever a code change is detected in the
repository.

For the purpose of this blog I will describe how to get a simple CI pipeline up and running for a node js based project.

The technologies we'll be using are the following:

- **Github**, The popular free source control host and tooling.
- **CircleCI**, A service that you can hook into your **Github** repo that will pull the latest code changes and run them through a configurable process.
- **Docker**, Containerisation. This isn't too important to know what it is, but it helps us with keeping our deployment environment predictable and stable.
- **DockerHub**, A free store to host our **Docker** images to enable the transfer of our production code.
- **Digital Ocean**, A service that hosts Virtual Private servers that we need to host our project in the cloud.

##Step 1: Setup

What we need to setup:

- A github repo.
- Circle ci and connect to our Github repo.
- Setup a digital ocean droplet.
- A Circle ci config file (.circleci/config.yml).
- A docker image file to create our docker image for deployment.

### Github repo

For the purpose of this tutorial I'll be using the following repository I have for an existing project:

![Github repo](./github-repo.png)

Creating a Github account, if you don't have one, and creating a repo should be pretty easy to setup.
We'll skip this setup stage.

### Connect Circle CI to our repo

First follow the steps on this page [https://circleci.com/docs/2.0/getting-started/]: https://circleci.com/docs/2.0/getting-started/

> Be sure to create the .circleci/config.yml file and push it to your repo.

Once your Github account is connected to your github repo we'll change the newly created config.yml to get our circleci workflow to build, test and deploy the project to digital ocean.

### Create a Digital Ocean droplet

Head on over to Digital Ocean and create an account.
Once you've logged in create a Droplet(the smallest \$5 one should be fine for the purposes of this tutorial).
