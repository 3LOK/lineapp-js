#!/usr/bin/perl
use strict;
use File::Find;
use IO::File;
use JSON;
use File::Slurp;
use utf8;

my $dest = shift;

my $addvar = 0;
if ($dest eq "-add_var")
{
    $addvar = 1;
    $dest = shift;
}

my %tokens = ();

find({wanted => \&work, no_chdir => 1}, @ARGV);

storeToFile(\%tokens, "css");

sub storeToFile
{
    my ($tokens, $locale) = @_;

    my $json = new JSON;
    my $json = $json->allow_nonref->utf8->relaxed->pretty->escape_slash->loose->allow_singlequote->allow_barekey->encode($tokens);

    my $fd = new IO::File("> $dest$locale.json");
    if ($addvar == 0)
    {
        print $fd $json;
    }
    else
    {
        print $fd "var spiceI18n = ".$json;
    }
    $fd->close();
}

sub work
{
    my $filename = $File::Find::name;
    if (!($filename =~ /\.css$/)) {return;}

    handleFile($filename);
}

sub handleFile
{
    my $filename = shift;

    my $fd = IO::File->new("< $filename");

    my $current_locale = undef;
    my %data = ();
    my $line = "";

    while (<$fd>)
    {
        chomp;
        $line = $line.$_;
    }

    while ($line =~ /\.(\S*?)\s*\{\s*(.*?)\s*\}/g)
    {
        my $name = $1;
        my $val = $2;
        while ($val =~ /\s*(\S*?)\s*:\s*(\S*?)\s*;/g)
        {
            my $token = $1;
            my $value = $2;

            addToken(\%tokens, $name, $token, $value);
        }
    }

    $fd->close();
}

sub addToken
{
    my ($hash, $parent, $name, $val) = @_;

    my @parts = split(/_/, $parent);

    foreach my $part (@parts)
    {
        if ($hash->{$part} eq undef)
        {
            my %arr = ();
            $hash->{$part} = \%arr;
        }
        $hash = $hash->{$part};
    }
    $hash->{$name} = $val;
}
