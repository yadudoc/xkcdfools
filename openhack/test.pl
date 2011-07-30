#!/usr/bin/perl
use warnings;
use strict;
my $p = {
        'monday' => ['blue', 'black'],
        'tuesday' => ['grey', 'heart attack'],
        'friday' => 'Gotta get down on Friday',
};
print $p->{monday}[1];
