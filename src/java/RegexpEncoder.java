/*
 * Copyright 2013 Samsung Information Systems America, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// Author: Koushik Sen

import dk.brics.automaton.Automaton;
import dk.brics.automaton.RegExp;
import dk.brics.automaton.State;
import dk.brics.automaton.Transition;

import java.util.IdentityHashMap;
import java.util.List;

interface Formula {
    String toCVC3FormulaString(String x);
}

class RelConstant implements Formula {
    int varIdx;
    char constant;
    String op;

    RelConstant(int varIdx, char constant, String op) {
        this.varIdx = varIdx;
        this.constant = constant;
        this.op = op;
    }

    public String toCVC3FormulaString(String x) {
        return " ( "+x+varIdx+" "+op+ " "+((int)constant)+" ) ";
    }
}

class AndFormula implements Formula {
    Formula left;
    Formula right;

    AndFormula(Formula left, Formula right) {
        this.left = left;
        this.right = right;
    }

    public String toCVC3FormulaString(String x) {
        return "("+left.toCVC3FormulaString(x)+" AND "+right.toCVC3FormulaString(x)+ ")";
    }
}

class OrFormula implements Formula {
    Formula left;
    Formula right;

    OrFormula(Formula left, Formula right) {
        this.left = left;
        this.right = right;
    }

    public String toCVC3FormulaString(String x) {
        return "("+left.toCVC3FormulaString(x)+" OR "+right.toCVC3FormulaString(x)+ ")";
    }
}

class TrueFormula implements Formula {
    public String toCVC3FormulaString(String x) {
        return "TRUE";
    }

}

class FalseFormula implements Formula {
    public String toCVC3FormulaString(String x) {
        return "FALSE";
    }
}

public class RegexpEncoder {
    // Usage: java -cp out/production/jalangijava/:lib/automaton.jar RegexpEncoder [length|content] regexp var_string [content_length|true|false]

    public static void main(String[] args) {
        boolean isLength = args[0].equals("length");
        RegExp r = new RegExp(args[1]);
        String prefix = args[2];
        int length=0;
        Automaton a = r.toAutomaton();
//        System.out.println(a.toDot());
        if (!isLength) {
            length = Integer.parseInt(args[3])-1;
            if (length==-1) {
                if (a.getInitialState().isAccept()) {
                    System.out.println("TRUE");
                } else {
                    System.out.println("FALSE");
                }
            } else {
                System.out.println(toCVC3FormulaString(a,prefix,length));
            }
        } else {
            boolean accept = args[3].equals("true");
            String example = a.getShortestExample(accept);
            if (example != null)
                System.out.println("(" + prefix + " >= " + example.length() + ")");
            else
                System.out.println("(" + prefix + " >= " + 0 + ")");
        }
    }


    public static String toCVC3FormulaString(Automaton A, String x, int n) {
        Formula tmp = createFormula(A, n);
        String ret = tmp.toCVC3FormulaString(x);
        return ret;
    }

    public static Formula createFormula(Automaton A, int n) {
        State root = A.getInitialState();
        if (n==0) {
            if (root.isAccept()) {
                return new TrueFormula();
            } else {
                return new FalseFormula();
            }
        } else {
            Formula ret = createFormula(root,0,n);
            return ret==null? new FalseFormula() : ret;
        }
    }

    public static Formula createFormula(State root, int i, int n) {
        IdentityHashMap<State, Formula> ret = new IdentityHashMap<State, Formula>();
        Formula collect = null;

        List<Transition> transitions = root.getSortedTransitions(false);
        for (Transition transition : transitions) {
            State next = transition.getDest();
            AndFormula tmp1 = new AndFormula(new RelConstant(i,transition.getMin(),">="), new RelConstant(i,transition.getMax(),"<="));
            Formula tmp2 = ret.get(next);
            if (tmp2 != null) {
                OrFormula tmp3 = new OrFormula(tmp2,tmp1);
                ret.put(next, tmp3);
            } else {
                ret.put(next,tmp1);
            }
        }
        if (i < n) {
            for (State next : ret.keySet()) {
                Formula suffix = createFormula(next, i + 1, n);
                if (suffix != null) {
                    Formula tmp4 = new AndFormula(ret.get(next), suffix);
                    if (collect == null) {
                        collect = tmp4;
                    } else {
                        collect = new OrFormula(collect, tmp4);
                    }
                }
            }
        } else {
            for (State next : ret.keySet()) {
                if (next.isAccept()) {
                    if (collect == null) {
                        collect = ret.get(next);
                    } else {
                        collect = new OrFormula(collect, ret.get(next));
                    }
                }
            }
        }
        return collect;
    }

}
