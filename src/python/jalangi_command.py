# Copyright 2013 Samsung Information Systems America, Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#        http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

# Author: Simon Jensen

from optparse import OptionParser
import sys
import os
import commands
import config_parser
import util

class InstrumentCommand:
    name = "Instrument"
    description = "Instrument JavaScript source files"
    def execute(self,params):
       # if len(params) < 1:
       #     print "Instrument requires a filename"
       #     sys.exit(1)
        parser = OptionParser()
        (options, args) = parser.parse_args(args=params)
        (ff,out) = commands.instrument(os.path.abspath(args[0]))
        print out

class AnalysisCommand:
    name = "Analysis"
    description = "Run a Jalangi Analysis"
    def execute(self, params):
        parser = OptionParser()
        parser.add_option("-a", "--analysis", dest="analysis",
                          help="Use analysis implemented in ANALYSIS", default="%NOT_SET")
        (options, args) = parser.parse_args(args=params)
        if len(args) < 1 or options.analysis == "%NOT_SET":
            print "Invalid command line"
            parser.print_help()
            sys.exit(1)
        print commands.analysis(options.analysis, os.path.abspath(args[0]))
        
class ConcolicCommand:
    name = "Conclic testing"
    description = "Generate test inputs using concolic testing"
    def execute(self, params):
        parser = OptionParser()
        parser.add_option("-i", "--inputs", dest="inputs",
                          help="Bound on number of inputs (default 1000)", default=1000)
        (options, args) = parser.parse_args(args=params)
        if len(args) < 1:
            print "You must specify a filename"
            parser.print_help()
            sys.exit(1)
        commands.concolic(args[0], int(options.inputs))

class RerunAllCommand:
    name = "Rerun all test cases"
    description = "Run all the test cases genereted by the Jalangi concolic tester"
    def execute(self,params):
        parser = OptionParser()
        (_,args) = parser.parse_args(args=params)
        if len(args) < 1:
            print "Please specify a filename"
            sys.exit(1)
        commands.rerunall(args[0])

class RunConfigCommand:
    name = "config"
    description = "Run Jalangi based on a configuration file"
    def execute(self,params):
        parser = OptionParser()
        (opt,args) = parser.parse_args(args=params)
        if len(args) != 1:
            print "Please specify exactly one configuration file to run"
            sys.exit(1)
        try:
            conf = config_parser.parse_jalangi_conf_file(args[0])
            commands.run_config(conf) 
        except util.JalangiException as e:
            print "Parsing conf file failed: {}".format(e.message)
            sys.exit(1)
        
        
        
COMMANDS = {"instrument" : InstrumentCommand,
            "analyze" : AnalysisCommand,
            "concolic" : ConcolicCommand,
            "rerunall" : RerunAllCommand,
            "config" : RunConfigCommand
}

def print_help():
    print "The following Jalangi commands are avaliable:"
    for k,v in COMMANDS.iteritems():
        print "{} - {}".format(k, v.description)

def main():
    args = sys.argv
    if len(args) == 1:
        print_help()
        sys.exit(0)
    command_name = args[1]
    if not command_name in COMMANDS.keys():
        print "Unknown command {}".format(command_name)
        print_help()
        sys.exit(1)
    command = COMMANDS[command_name]()
    command.execute(args[2:])

if __name__ == "__main__":
    main()
