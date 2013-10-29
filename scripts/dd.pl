#!/opt/local/bin/perl

$n = 2;
$oldlen = 0;
$cmd = "scripts/timeout -t 10 node box2d.js > /dev/null 2>&1 && python scripts/jalangi.py analyze -a analyses/nop/NOPEngine box2d 2>&1 | grep 'Error: Path deviation at record'";



while(1) {
	$filecontent = "";
	open(FILE,"<$ARGV[0].js");
	while ($line = <FILE>) {
        	$filecontent = $filecontent . $line;
	}
	close(FILE);


	$len = length $filecontent;
	if ($oldlen == $len) {
		print "Simplified 2\n";
		exit(0);
	}
	$oldlen = $len;
        print "Outer while $len\n";
	$size = $len/$n;

#        print $filecontent;


	L1: while ($size >= 1) {
		for ($i=1;$i<=$n;$i++) {
			get_deltasmall();
			system("rm *_jalangi_.js  > /dev/null 2>&1");
			$ret = system($cmd);
			if ($ret == 0) { 
			  $n = 2;
			  system("cp $ARGV[0].js $ARGV[0]_min2.js");
			  last L1; 
			}
			get_deltalarge();
			system("rm *_jalangi_.js  > /dev/null 2>&1");
			$ret = system($cmd);
			if ($ret == 0) { 
			  $n = $n - 1; 
			  system("cp $ARGV[0].js $ARGV[0]_min2.js");
			  last L1; 
			}
		}
		$n = $n * 2;
		$size = $len/$n;
	}
	if( $ret != 0) {
		print "Simplified\n";
		exit 0;
	}
}

sub get_deltasmall {
	if ($i==$n) {
		$str = substr($filecontent,($i-1)*$size);
	} else {
		$str = substr($filecontent,($i-1)*$size,$size);
	}
	open(OUT,">$ARGV[0].js");
	print OUT "$str";
	close(OUT);
}

sub get_deltalarge {
	$str = $filecontent;
	if ($i==$n) {
		substr($str,($i-1)*$size, $len - (($i-1)*$size),"");
	} else {
		substr($str,($i-1)*$size,$size,"");
	}
	open(OUT,">$ARGV[0].js");
	print OUT "$str";
	close(OUT);
}

