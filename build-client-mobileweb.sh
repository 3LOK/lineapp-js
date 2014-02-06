#!/bin/sh

BUILD=./build/client-mobileweb
DIST=./dist/client-mobileweb

\rm -rf $BUILD
mkdir $BUILD
\rm -rf $DIST
mkdir $DIST

egrep -v "^include" ./lib/http -d recurse -h --include "*.js" >> $BUILD/app.js

egrep -v "^include" ./src/client-mobileweb -d recurse -h --include "*.js" --exclude "app.js" >> $BUILD/app.js
egrep -v "^include" ./src/client-mobileweb -d recurse -h --include "app.js">> $BUILD/app.js

cat $BUILD/app.js | perl -pe 's/\r//g' > $DIST/app.js
java -jar -Xmx1024m ./utils/closure/compiler.jar --jscomp_off internetExplorerChecks --js $DIST/app.js --js_output_file $DIST/app2.js
mv $DIST/app2.js $DIST/app.js

./create_css.sh $DIST/ src/client-mobileweb

cp ./src/client-mobileweb/*.png $DIST/ 2>/dev/null
cp ./src/client-mobileweb/*.html $DIST/ 2>/dev/null

cp -R $DIST/* ~/Dropbox/Public/lineapp/
