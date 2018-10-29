FROM ubuntu:latest

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && \
    apt-get install -y \
            build-essential \
            git \
            libdb-dev \
            libsodium-dev \
            libtinfo-dev \
            sysvbanner \
            unzip \
            wget \
            zlib1g-dev


ENV GOREL go1.7.3.linux-amd64.tar.gz
ENV PATH $PATH:/usr/local/go/bin

RUN wget -q https://storage.googleapis.com/golang/$GOREL && \
    tar xfz $GOREL && \
    mv go /usr/local/go && \
    rm -f $GOREL

RUN apt-get update && \
    apt-get install -y --no-install-recommends software-properties-common && \
    add-apt-repository ppa:ethereum/ethereum && \
    apt-get update

# Install add-apt-repository
RUN apt-get install -y build-essential unzip libdb-dev libleveldb-dev libsodium-dev zlib1g-dev libtinfo-dev solc sysvbanner \
                   git python dstat ntp nodejs solc ethereum npm software-properties-common vim sudo

RUN mkdir -p /home/app-backend
ADD app-backend /home/app-backend

RUN mkdir -p /home/app-frontend
ADD app-frontend /home/app-frontend

RUN npm install -g truffle
RUN npm install -g ganache-cli

# Add the PostgreSQL PGP key to verify their Debian packages.
# It should be the same key as https://www.postgresql.org/media/keys/ACCC4CF8.asc
RUN apt-key adv --keyserver keyserver.ubuntu.com --recv-keys B97B0AFCAA1A47F044F244A07FCC7D46ACCC4CF8

# Add PostgreSQL's repository. It contains the most recent stable release
#     of PostgreSQL, ``9.6``.
RUN echo "deb http://apt.postgresql.org/pub/repos/apt/ precise-pgdg main" > /etc/apt/sources.list.d/pgdg.list

# Update the Ubuntu and PostgreSQL repository indexes
RUN apt-get update && apt-get install -y apt-utils apt-transport-https ca-certificates

# Install PostgreSQL 9.6
RUN apt-get -y -q install postgresql-9.6 postgresql-client-9.6 postgresql-contrib-9.6

RUN cd /home/app-backend &&\
    npm install &&\
    cd /home/app-frontend &&\
    npm install


CMD /etc/init.d/postgresql start &&\
    sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'postgres';" &&\
    cd /home/app-backend/ &&\
    npm run start &> /dev/null &&\
    ganache-cli &> dev/null  &&\
    cd /home/app-backend/ &&\
    truffle compile --all &&\
    truffle migrate --reset --network dev &&\
    node ./devSetup.js &> dev/null &&\
    cd /home/app-frontend &&\
    npm run start


EXPOSE 3000 3001
