#!/bin/sh

######################### INIT PROCESS ##############################

BUILD=./build/client-titanium
DIST=./dist/client-titanium

TIPACK_TOKEN="tipack|info@openrest.com|0pensh0veFTW!"

DEV_PROD="dev"
TIPACK_PROJECT=""
TIPACK_VERSION=""

function usage
{
    echo "usage: $0 [-d|-b|-p]"
}

function pause(){
   read -p "$*"
}


DEV_PROD="dev"
TIPACK_PROJECT="org.battlehack.lineapp.client-1"
TIPACK_VERSION="1.0.0"

echo ""
echo "Uploading to: $TIPACK_PROJECT version: $TIPACK_VERSION"

if [ "$DEV_PROD" == "prod" ]; then
    pause "Press [Enter] to start uploading process."

fi
echo ""

######################### BUILD PROCESS ##############################

\rm -rf $BUILD
mkdir $BUILD
\rm -rf $DIST
mkdir $DIST

cat ./src/bootstrap-titanium.js >> $BUILD/app.js

egrep -v "^include" ./lib/tipack4js -d recurse -h --include "*.js" --exclude "AppWrapper.js" >> $BUILD/app.js
egrep -v "^include" ./lib/underscore -d recurse -h --include "*.js" >> $BUILD/app.js
egrep -v "^include" ./lib/http -d recurse -h --include "*.js" >> $BUILD/app.js
egrep -v "^include" ./lib/xml -d recurse -h --include "*.js" >> $BUILD/app.js

egrep -v "^include" ./src/client-titanium -d recurse -h --include "*.js" --exclude "app.js" >> $BUILD/app.js
egrep -v "^include" ./src/client-titanium -d recurse -h --include "app.js">> $BUILD/app.js

if [ "$DEV_PROD" == "dev" ]; then
    echo "Dev: Copying app.js"
    cp $BUILD/app.js $DIST/app.js
    \
else
    echo "Prod: Running closure"
    java -jar -Xmx1024m ./utils/closure/compiler.jar --jscomp_off internetExplorerChecks --js $BUILD/app.js --js_output_file $DIST/app.js
fi

cp ./src/client-titanium/*.png $DIST/ 2>/dev/null
cp ./src/client-titanium/*.html $DIST/ 2>/dev/null

######################### DEPLOY PROCESS ##############################

chmod a+rw $DIST/*
cd ./utils/tipack-1.0.0/

_CLASSPATH=""

if [ "$(uname)" == "Darwin" ]; then
    # Do something under Mac OS X platform        
    _CLASSPATH=$(echo *.jar | tr ' ' ':')

elif [ "$(expr substr $(uname -s) 1 5)" == "Linux" ]; then
    # Do something under Linux platform
    echo "No classpath defined for linux!"

elif [ "$(expr substr $(uname -s) 1 9)" == "CYGWIN_NT" ]; then
    # Do something under Windows NT platform
    _CLASSPATH="*;./*"

fi

echo "Classpath is: $_CLASSPATH"

java  -Xmx1024m -cp $_CLASSPATH com.openrest.tipack.v1_0.Uploader $TIPACK_TOKEN $TIPACK_PROJECT $TIPACK_VERSION ../.$DIST

cd ../..
