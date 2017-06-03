var args = require('minimist')(process.argv.slice(2)),
		fs = require('fs'),
		glob = require('glob'),
		shelljs = require('shelljs'),
		_ = require('lodash'),
		chalk = require('chalk')
		
var _7Z = '"C:\\Program Files (x86)\\7-Zip\\7z.exe"'

if ( args.h || args.help || args._.length < 1 ) {
	console.log(`
Uso: folders2cbz <dir> --save

  Desce em <dir>, recursivamente; para cada dir cujo conteúdo seja composto apenas
	de arquivos de imagem (sem sub-dirs), converte em um cbz, apagando o dir. Este
	utilitário apenas loga os comandos; se passar --save, os comandos serão executados.
`)
	process.exit()
}

function handleErr(err) { console.log(err.stack); process.exit() }

// com "/" no final, só encontra dirs
glob('**/', {cwd: args._[0], realpath:true}, (err, matches) => {
	if ( err ) handleErr(err)
	matches.forEach(handleDir)	
})

function isDir(f) { return fs.statSync(f).isDirectory() }

function handleDir(dir) {	
	var items = fs.readdirSync(dir)
	
	// Para ser convertido em cbz, um diretório precisa:
	// 1. Não conter outros subdirs
	// 2. Não conter PDFs
	// 3. Conter pelo menos um arquivo de imagem (.gif, .jpg, .jpeg, .png)
	if ( items.length < 1 ) {
		console.log(`Dir ${chalk.red(dir)} does not contain any files`)
		return
	}
	
	if ( ! _.some(items, i => i.toLowerCase().match(/gif$|jpg$|jpeg$|png$/)) ) {
		console.log(`Dir ${chalk.red(dir)} does not contain any image files`)
		return
	}
	
	if ( _.some(items, i => i.toLowerCase().match(/pdf$/)) ) {
		console.log(`Dir ${chalk.red(dir)} contains a PDF file`)
		return
	}
	
	if ( _.some(items, i => isDir(dir + '/' + i)) ) {
		console.log(`Dir ${chalk.red(dir)} contains subdirs`)
		return
	}
	
	console.log(`Dir ${chalk.green(dir)} can be zipped to a CBZ archive`)
	var cmd = `${_7Z} -tzip a "${dir}.cbz" "${dir}"`
	
	if ( args.v )
		console.log(cmd)
	
	if ( args.save ) {
		var proc = shelljs.exec(cmd)
		console.log('Exit code:', proc.code)
		
		if ( args.v ) {
			console.log('Program output:', proc.stdout)
		}
		
		if ( proc.stderr != null && proc.stderr.trim().length > 0 ) {
			console.log('Program stderr:', chalk.red(proc.stderr))
		}
	}
	
}
	
	
	