import util
import sys

def parser_kv_pairs(input_string):
    res = {}
    for l in input_string.splitlines():
        if len(l) == 0:
            continue
        if l[0] == "#":
            continue
        toks = l.split("=")
        assert len(toks) == 2
        res[toks[0]] = toks[1]
    return res

class JalangiConfig:
    pass

def parse_jalangi_conf_file(input_f, jalangi=util.DEFAULT_INSTALL):
    with open(input_f, 'r') as f:
        content = f.read()
    kv_pairs = parser_kv_pairs(content)
    res = JalangiConfig()
    if "parameterstoprog" in kv_pairs:
        res.arguments = kv_pairs["parameterstoprog"]
    if "mainfile" in kv_pairs:
        res.mainfile = kv_pairs["mainfile"]
    else:
        raise util.JalangiException(jalangi, "Config must specify at least one file to analyze")
    if "parameters" in kv_pairs:
        res.parameters = kv_pairs["parameters"]
    if "workingdirectory" in kv_pairs:
        res.working = kv_pairs["workingdirectory"]
        if sys.platform == "win32":
            #Work around Java escaping the ":" in its .properties format
            res.working = res.working.replace("\\:",":",1)
    else:
        raise util.JalangiException(jalangi, "Config must specify the working directory")
    if "resources" in kv_pairs:
        res.resources = kv_pairs["resources"]
    if "analysis" in kv_pairs:
        res.analysis = kv_pairs["analysis"]
    else:
        raise util.JalangiException(jalangi, "Config must specify an analysis to be run")
    if "cover" in kv_pairs:
        res.cover = kv_pairs["cover"] == "true"
    else:
        res.cover = False
    if "dot" in kv_pairs:
        res.dot = kv_pairs["dot"]
    else:
        res.dot = False
    return res
