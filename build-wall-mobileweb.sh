#!/bin/sh

BUILD=./build/client-mobileweb
DIST=./dist/client-mobileweb

\rm -rf $BUILD
mkdir $BUILD
\rm -rf $DIST
mkdir $DIST

egrep -v "^include" ./lib/http -d recurse -h --include "*.js" >> $BUILD/app-wall.js

egrep -v "^include" ./src/common -d recurse -h --include "*.js" --exclude "app.js" --exclude "app-wall.js" >> $BUILD/app-wall.js
egrep -v "^include" ./src/client-mobileweb -d recurse -h --include "*.js" --exclude "app.js" --exclude "app-wall.js" >> $BUILD/app-wall.js
egrep -v "^include" ./src/client-mobileweb -d recurse -h --include "app-wall.js">> $BUILD/app-wall.js

cat $BUILD/app-wall.js | perl -pe 's/\r//g' > $DIST/app-wall.js
java -jar -Xmx1024m ./utils/closure/compiler.jar --jscomp_off internetExplorerChecks --js $DIST/app-wall.js --js_output_file $DIST/app-wall2.js
mv $DIST/app-wall2.js $DIST/app-wall.js

./create_css.sh $DIST/ src/client-mobileweb

cp ./src/client-mobileweb/*.png $DIST/ 2>/dev/null
cp ./src/client-mobileweb/*.html $DIST/ 2>/dev/null

cp -R $DIST/* /cygdrive/c/Dropbox/Public/lineapp/
