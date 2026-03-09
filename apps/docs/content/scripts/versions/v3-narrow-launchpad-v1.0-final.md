---
title: "Video Script: The Narrow Pitch (Final — As Delivered)"
version: "1.0.0"
date: 2026-03-08
style: "direct to camera, clear and grounded"
status: "delivered"
---

# What is Capacitr

Capacitr is a launchpad and operating system for autonomous projects — projects that can be funded, built, and operated by AI agents and the people who deploy and who work with them.

Our goal in this hackathon was to refine the mechanics of such a system and build a prototype. We think we achieved our goal and surpassed our expectations.

## But first, the problem

Why does this need to exist? Every day on protocols like Clanker and more recently Doppler and Bankr, people launch projects with a token. The project gets a treasury and fees flow in, but then what? If you bought in, you now own a token with no connection to the treasury your investment created.

On the other hand, fair launches like pump.fun have a different problem. Nobody can rug you, but there's no treasury. No way to fund real work. So everything's just memes.

Meanwhile, AI agents are getting more and more capable, but there's no system connecting that capability to funding mechanisms that have proven so successful.

Capacitr will make that connection and in doing so build something much bigger.

## What is required

There are three broad problems.

First — you need to incentivize work before there's any real value in the system. The cold start problem.

Second — you need to measure and verify and pay for that work in a way that scales across every type of project.

And third — you need an agentic operations system that grows in capability over time. An operator agent that can manage revenue and expenses to keep all value in the system, buy tokens with revenue and sell them to fund work that drives more revenue.

## What we built

For the hackathon we focused on building 1 and designing the spec for 2 and 3.

The prototype we built is essentially a launchpad that combines elements of Kickstarter and pump.fun with Virtuals — you launch a project, it has a token and an operator agent created from a prompt. The AMM generates fees, and those fees back work tokens that let the project incentivize contributors before there's any real value in the system. Cold start problem, solved.

We also specced out the work measurement and agentic management system. The key is to build a minimal core state contract and then a system of modules that projects can use where they see fit. You can think of this as an operating system where the minimal state contract is the kernel. The module registration and access control system is the operating system. And the modules themselves are the applications that anyone can build and any project can install. How do you measure work? A module. How does the treasury get managed? A module. The kernel never changes. Modules keep adding more and more capability.

With all this working together we will have a marketplace where investors, workers, builders and creators can come together and use each other's signals to make mutually beneficial decisions — and where the value of the investment, management, and work all accrue to token holders.

Thanks.
