FROM ubuntu:latest
RUN apt update
RUN apt upgrade -y
RUN apt install -y curl
RUN curl -fsSL https://deb.nodesource.com/setup_20.x -o nodesource_setup.sh
RUN bash nodesource_setup.sh
RUN apt install -y nodejs
COPY . /app
RUN cd /app && npm install

ENTRYPOINT ["npm", "run", "start"]