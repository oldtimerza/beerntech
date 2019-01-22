--
title: Simple CI pipeline - Part 2 - Configuration
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
```
