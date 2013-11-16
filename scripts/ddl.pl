#!/opt/local/bin/perl

$n = 2;
$oldlen = 0;

$cmd = "scripts/timeout -t 10 node box2d.js > /dev/null 2>&1 && python scripts/jalangi.py analyze -a analyses/nop/NOPEngine box2d 2>&1 | grep 'Error: Path deviation at record'";
#$cmd = "export JALANGI_MODE=record; export JALANGI_ANALYSIS=none; node src/js/instrument/esnstrument.js a.out.js && scripts/timeout -t 4 node a.out.js && node a.out_jalangi_.js 2>&1 | grep 'TypeError: Cannot read property'";

while(1) {
	@filecontent = ();
	open(FILE,"<$ARGV[0].js");
	while ($line = <FILE>) {
        	push(@filecontent, $line);
	}
	close(FILE);


	$len = @filecontent;
	if ($oldlen == $len) {
		print "Simplified 2\n";
		exit(0);
	}
	$oldlen = $len;
        print "Outer while $len\n";
	$size = $len/$n;

	L1: while ($size >= 1) {
		for ($i=1;$i<=$n;$i++) {
			get_deltasmall();
			system("rm *_jalangi_.js  > /dev/null 2>&1");
			$ret = system($cmd);
			if ($ret == 0) { 
			  $n = 2;
			  system("cp $ARGV[0].js $ARGV[0]_min.js");
			  last L1; 
			}
			get_deltalarge();
			system("rm *_jalangi_.js > /dev/null 2>&1");
			$ret = system($cmd);
			if ($ret == 0) { 
			  $n = $n - 1; 
			  system("cp $ARGV[0].js $ARGV[0]_min.js");
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
	  $begin = ($i-1)*$size;
	  $end = scalar(@filecontent);
	} else {
	  $begin = ($i-1)*$size;
	  $end = $i * $size;
	}
	open(OUT,">$ARGV[0].js");
	for ($j = $begin; $j <$end; $j++) {
	  print OUT @filecontent[$j];
	} 
	close(OUT);
}

sub get_deltalarge {
	if ($i==$n) {
	  $begin = ($i-1)*$size;
	  $end = $len;
	} else {
	  $begin = ($i-1)*$size;
	  $end = $i * $size;
	}
	open(OUT,">$ARGV[0].js");
	for ($j = 0; $j < $len; $j++) {
	  if (!($j >= $begin && $j < $end)){
	    print OUT @filecontent[$j];
	  }
	} 
	close(OUT);
}

