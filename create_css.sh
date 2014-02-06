DEST=$1

shift;

cat spice-rtl.base.css > $DEST/spice-rtl.css.tmp
cat spice-ltr.base.css > $DEST/spice-ltr.css.tmp

for i in $*; do
    find $i -name "*.css" | xargs cat | perl -ne 'my $t=time();s/START/right/g;s/END/left/g;s/DIR/rtl/g;s/STATIC\(([^\?]*?)\)/$1?v=$t/g;s/STATIC\((.*?)\)/$1&v=$t/g;print $_;' >> $DEST/spice-rtl.css.tmp
    find $i -name "*.css" | xargs cat | perl -ne 'my $t=time();s/START/left/g;s/END/right/g;s/DIR/ltr/g;s/STATIC\(([^\?]*?)\)/$1?v=$t/g;s/STATIC\((.*?)\)/$1&v=$t/g;print $_;' >> $DEST/spice-ltr.css.tmp
done

lessc $DEST/spice-rtl.css.tmp > $DEST/spice-rtl.css
lessc $DEST/spice-ltr.css.tmp > $DEST/spice-ltr.css

rm $DEST/spice-rtl.css.tmp
rm $DEST/spice-ltr.css.tmp
