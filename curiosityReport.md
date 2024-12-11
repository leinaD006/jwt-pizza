# Docker Containers and Operating System Support

# What I Learned

## Container Basics

- Containers aren't actually virtual machines - they're just regular processes with extra isolation
- They use special Linux kernel features that have been around way longer than Docker
- The main difference from regular processes is that containers can only see certain parts of the system

## Linux Kernel Features

### Namespaces

- Think of namespaces like one-way mirrors for processes
- Different types of namespaces control what the container can see:
  - PID namespace: Makes the container think it's the only thing running
  - Network namespace: Gives the container its own network stack
  - Mount namespace: Controls what files the container can see
  - User namespace: Maps users inside and outside the container
  - UTS namespace: Lets the container have its own hostname

### Control Groups (cgroups)

- These are like resource bouncers for your containers
- They control:
  - How much CPU the container can use
  - How much memory it gets
  - How much I/O it can do
  - What devices it can access

## How Docker Uses These Features

- Docker isn't doing the heavy lifting - it's mostly just making these kernel features easier to use
- When you run a container, Docker:
  1. Sets up all the namespaces
  2. Creates the cgroups
  3. Sets up a filesystem for the container
  4. Starts your process inside this isolated environment

# Cool Things I Learned

## Security

- Containers are only as secure as the kernel they run on
- Running as root in a container can be dangerous if user namespaces aren't set up right
- The isolation isn't perfect - containers can still affect each other through shared kernel resources

## Performance

- Containers have almost no overhead compared to regular processes
- They start up way faster than VMs because they don't need to boot an OS
- Multiple containers share the same kernel, which saves memory

# Resources I Found Helpful

- Linux Kernel Documentation on namespaces and cgroups
- Docker's own documentation on container runtime
- Various blog posts
  - https://medium.com/@armond10holman/virtualization-and-docker-containers-simply-explained-by-a-junior-devops-engineer-714de7801187
  - https://medium.com/@kuninoto/how-does-docker-really-work-under-the-hood-a-dive-into-dockers-internals-2fef63f7c9bb

# Future Areas to Explore

- Windows container internals (they work differently!)
- Container orchestration systems like Kubernetes
