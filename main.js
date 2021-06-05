let { readFileSync } = require("fs");
const { type } = require("os");
const { exit } = require("process");

let parse = (string) =>
  string
    .toString()
    .split(/\n/)
    .map((elem) => elem.trim())
    .filter((elem) => elem !== "");

let functions = {};

let vars = {
  args: ["hi!"],
};

var globals = {
	lineNum: 0,
	fnName: "",
	unsafe: false
}

let parseArgs = (args, num, fnName) => {
  const line = args.join(" ");
  //
  // The first solution was considered, but then scrapped because it did not honour the order of the arguments :/
  //

  /*
	const str = line.match(/".*?(?<!\\)"/g).map(str => str.slice(1,-1));
	const int = line.match(/\d+(\.\d+)?/g).map(int => parseFloat(int));
	console.log(str, int)
	*/

	// Only used one regex in comparison to several because several reg-exps 
	// would not honour the order of arguments

  let parsedArgs = line.match(
		// String       Number/Float         Variable ref  Func    Double-   Array  Bool
		//                                                         parse
    /(".*?(?<!\\)")|([0-9]+(\.[0-9]+)?)|(\$\S+(\.\S+)*)|(>.+?<)|!\(\S+\)|\[.*\]|(true|false)/g
  );

  let argOptions = {
    $: (elem) => {
			
      if (elem.slice(1) in vars) {
        return vars[elem.slice(1)];
      } else if (elem.slice(1) in vars.args) {
        return vars.args[elem.slice(1)];
      }
			 
			else {
				if(!elem) {
					console.log(
						`Attempted to access undefined variable at line ${globals.lineNum} of ${globals.fnName}`
					);
					exit(1);
				}
      }
			
    },
    ">": (elem) => run([elem.slice(1, -1)], globals.fnName, [], true),
    "!": (elem) => {
      console.log(elem.split(" "));
      parseArgs(elem.slice(2, -1).split(" "));
    },
    '"': (elem) => elem.slice(1, -1).replace(/\\"/g, '"'),
		"[": (elem) => {
			elem = elem.slice(1, -1);
			elem = parseArgs(elem.split(/,\s*/));
			return elem
		},
		"t": () => true,
		"f": () => false
  };
	if(!parsedArgs) {
		console.log(`Argument parser failed at line ${globals.lineNum} of ${globals.fnName}! \nMost likely due to invalid user input`)
		exit(1)
	}
  return parsedArgs.map((elem) => {
    if (/\d+$/.test(elem)) return parseFloat(elem);
    else return argOptions[elem[0]](elem);
  });

  /*
	// This solution is *HELLA JANK* but it works.
	
	* This solution got deprecated in favor of a better-engineered one :)

  return parsedArgs.map((elem) => {
    if (parseFloat(elem)) return parseFloat(elem);
    else if (elem.startsWith("$")) {
      if (elem.slice(1) in vars) {
        return vars[elem.slice(1)];
      } else if (elem.slice(1) in vars.args) {
        return vars.args[elem.slice(1)];
      } else {
        console.log(
          `Attempted to access undefined variable at line ${num} of ${fnName}`
        );
        exit(1);
      }
    } else if (elem.startsWith(">")) {
      return run([elem.slice(1, -1)], fnName, [], true);
    } else if(elem.startsWith("!")) {
			console.log(elem.split(" "))
			parseArgs(elem.slice(2,-1).split(" "))
		} 
		else if (elem.startsWith('"') && elem.endsWith('"'))
      return elem.slice(1, -1);
  });
	*/
};

let file = parse(readFileSync("shrimp.imp"));

const builtIns = {
  display: (args, num, fnName) => {
    args = parseArgs(args, num, fnName);
    console.log(args.join(" "));
  },
  var: (args) => {
    vars[args[1]] = parseArgs(args.slice(2, vars.length));
  },
  add: (args) => {
    let toAdd = parseArgs(args.slice(1));
    // acc == accumulator
    // cur == current value
    return toAdd.reduce((acc, cur) => Number(acc) + Number(cur));
  },
	concat: (args) => {
    let toAdd = parseArgs(args.slice(1));
    // acc == accumulator
    // cur == current value
    return toAdd.reduce((acc, cur) => acc + cur);
  },
	mult: (args) => {
		let toMultiply = parseArgs(args.slice(1));
		return toMultiply.reduce((acc, cur) => acc*cur)
	},
	div: (args) => {
		let toDivide = parseArgs(args.slice(1));
		return toDivide.reduce((acc, cur) => acc/cur)
	},
	sub: (args) => {
		let toSubtract = parseArgs(args.slice(1))
		return toSubtract.reduce((acc, cur) => acc - cur)
	},
	mod: (args) => {
		let toMod = parseArgs(args.slice(1));
		return toMod.reduce((acc, cur) => acc%cur)
	},
	pow: (args) => {
		let toPower = parseArgs(args.slice(1));
		return toPower.reduce((acc, cur) => acc**cur)
	},
	log: (args) => {
		console.log(parseArgs(args.slice(1))[0])
	},
	bin: (args) => {
		args.shift();
		// Due to weird type cohesion and ints concatenating unto strings, 
		// I need to convert acc into a Number type first! :<

		// ParseArgs solves this by changing all the types to Int and
		// forcing .reduce() to use the int type, but due to laziness
		// I will not do that and will use the worse solution.
		if(args.length === 1) {
			return parseInt(args[0], 2)
		}

		return args.reduce((acc, val) => Number(acc) + parseInt(val, 2));
	},
	hex: (args) => {
		args = args.slice(1)

		if(args.length === 1) {
			return parseInt(args[0], 16)
		}

		return args.reduce((acc, cur) => Number(acc) + parseInt(cur, 16))
	},
	xor: (args) => {
		args = args.slice(1)
		return args.reduce((acc, cur) => Number(acc) ^ parseInt(cur, 16))
	},
	if: (args) => {
		let proc = parseArgs(args)
		if(proc[0] === true) {
			let fn = args.join(" ").split("do")[1].trim();
			run(functions[fn])
		}
	},
	"if?": (args) => {
		let proc = parseArgs(args)
		if(proc[0]) {
			let fn = args.join(" ").split("do")[1].trim();
			run(functions[fn])
		}
	},
	loop: (args) => {
		args.shift();
		args = args.join(" ").split("do");
		let proc = parseArgs(args[0].split(" "));
		for(let j = proc; j > 0; j--) {
			run(functions[args[1].trim()], args[1], [])
		}
	},
	eq: (args) => { 
		args = parseArgs(args);
		let out = true;
		args.forEach(
			elem => args.forEach(
				check => (elem===check ? "" : out = false)
			)
		)
		return out
	},
	push: (args)=> {
		args.shift();
		args = parseArgs(args);
		args[0].push(args.slice(1))
	},
	"eq?":(args) => {
		args = parseArgs(args);
		let out = true;
		args.forEach(
			elem => args.forEach(
				check => (elem==check ? "" : out = false)
			)
		)
		return out
	},
	base: (args) => {
		let base = args[1];
		args = args.slice(2);
		if(args.length === 1) {
			return parseInt(args[0], base)
		}
		return args.reduce((acc, cur) => Number(acc) + parseInt(cur, base))
	},
	"#[unsecure!]": () => {
		globals.unsafe = true
	},
	// This function is not part of the Shrimp standard, as the parser may not be written in an interpreted language..!
	// It should only exist for languages that are interpreted. An optional part of the standard :) (I mean, compiled
	// Shrimp is also ok too :)
	"#UNSECURE(EVAL_NATIVE)": (args, num, fnName) => {
		if(!globals.unsafe) {
			console.log(`Failed to execute unsafe function at line ${globals.lineNum} of ${globals.fnName} due to unsafe being set to 'false'.`)
			console.log("You can change this setting by putting #[unsafe!] in any of your executed functions to toggle the setting ON. Afterwards,")
			console.log("you will be unable to turn it off.")
			exit(1)
		}
		eval(args.slice(1).join(" "))
	},
	ret:(args) =>{
		args = parseArgs(args)
		return {
			marker:"return!",
			data: args
		}
	}
};

// This is the preliminary run to define all functions
file.forEach(
  // num == line number
  (line, num) => {
    // proc = processable line
    let proc = line.split(" ");
    let cmd = proc[0];
    if (cmd.startsWith("@")) {
      let fnName = cmd.slice(1);
      if (fnName in builtIns) {
        console.log(
          "Attempted to define a function which overrides the standard namespace!"
        );
        exit(1);
      }
      functions[fnName] = parse(
        file
          .slice(num)
          .join("\n")
          .match(/{(\s|\S)+?}/m)
      ).slice(1, -1);
    }
  }
);

let returnOptions = {
	"return!":(out) => out.data
};

// Running the code
function run(codeblock, fnName, args, ret = false) {
  vars.args = args;
	globals.fnName = fnName;
  for (num in codeblock) {
		globals.lineNum = num;
		if(codeblock[num].startsWith("#!"))
			continue
    // proc == processable line
    let proc = codeblock[num].split(" ");
    // cmd == function to be run
    let cmd = proc[0];
    if (cmd in builtIns) {
      let out = builtIns[cmd](proc, num, fnName);
      if (ret) return out;
			if(out?.marker in returnOptions) return returnOptions[out.marker](out);
      continue;
    } else if (cmd in functions) {
      vars.fnArgs = proc.slice(1);
      let out = run(functions[cmd], cmd, proc);
      if (ret) return out;
      continue;
    }
    console.log(`Unknown function "${cmd}" at line ${globals.lineNum} of ${globals.fnName}`);
    exit(1);
  }

  // Deprecated below code because it does not 
	// let the function return any values(! :<)

  /*
  codeblock.forEach((line, num) => {
		// proc == processable line
    let proc = line.split(" ");
		// cmd == function to be run
    let cmd = proc[0];
    if (cmd in builtIns) {
      return builtIns[cmd](proc, num, fnName);
    } else if (cmd in functions) {
      vars.fnArgs = proc.slice(1);
      return run(functions[cmd], cmd, proc);
    }
    console.log(`Unknown function "${cmd}" at line ${num} of ${fnName}`);
    exit(1);
  });
	*/
}

if (!"main" in functions) {
  console.log("You must define a main function!");
  exit(1);
}

run(functions["main"], "main", process.argv);
