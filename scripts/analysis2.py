import sj
import sys

# scripting jalangi sample 2
sj.create_and_cd_jalangi_tmp()
sj.execute(sj.INSTRUMENTATION_SCRIPT+' ../'+sys.argv[1]+'.js')
normal = sj.execute_return('../'+sys.argv[1]+'.js', savestderr=True)
ana = sj.execute_return(sj.ANALYSIS2_SCRIPT+' --analysis ../src/js/analysis2CallbackTemplate.js ../'+sys.argv[1]+'_jalangi_.js', savestderr=True)

if normal != ana:
    print "{} failed".format(sys.argv[1])
    print normal
    print ana
else:
    print "{} passed".format('tests/unit/instrument-test.js')
    print normal
    print ana
sj.cd_parent()
