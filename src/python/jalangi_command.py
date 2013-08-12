from optparse import OptionParser
import sys
import instrument

class InstrumentCommand:
    name = "Instrument"
    description = "Instrument JavaScript source files"
    def execute(self,params):
        if len(params) < 1:
            print "Instrument requires a filename"
            sys.exit(1)
        parser = OptionParser()
        (options, args) = parser.parse_args(args=params)
        (ff,out) = instrument.instrument(args[0])
        print "Instrument file : {}".format(ff)
        print out
        

COMMANDS = {"instrument" : InstrumentCommand}

def print_help():
    print "The following Jalangi commands are avaliable:"
    for k,v in COMMANDS.iteritems():
        print "{} - {}".format(k, v.description)

def main():
    args = sys.argv
    if len(args) == 1:
        print_help()
        sys.exit(0)
    command_name = args[1],
    if not command_name in COMMANDS:
        print "Unknown command \"{}\"".format(command_name)
        print_help()
        sys.exit(1)
    command = COMMANDS[command_name]()
    command.execute(args[2:])

if __name__ == "__main__":
    main()
