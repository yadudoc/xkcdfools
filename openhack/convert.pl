#!/usr/bin/perl -w
#use strict;
#use warnings;
#use diagnostics;
use JSON::Parse 'json_to_perl';


open JSONFILE, "test.json" or die "Cant open file";
open RESULT, ">>result.js" or die " Result file cannot be opened\n";

my $json_file = "";
while( <JSONFILE> ) {
    $json_file = $json_file . "$_";
}

my $parsed_feeds = json_to_perl( $json_file );
my $num_elements = $parsed_feeds->{query}->{count};

for($i=0;$i<$num_elements;$i++) {
    print RESULT "$parsed_feeds->{query}->{results}->{item}[$i]->{title}\n";
    print RESULT "$parsed_feeds->{query}->{results}->{item}[$i]->{link}\n";
    print RESULT "$parsed_feeds->{query}->{results}->{item}[$i]->{description}\n";
    print  "$parsed_feeds->{query}->{results}->{item}[$i]->{title}\n";
    print  "$parsed_feeds->{query}->{results}->{item}[$i]->{link}\n";
    print  "$parsed_feeds->{query}->{results}->{item}[$i]->{description}\n";
}

