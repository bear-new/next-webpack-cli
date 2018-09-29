#! /usr/bin/env node
const fs = require('fs');
const program = require('commander'); // 自动解析命令和参数，用于处理用户输入的命令
const download = require('download-git-repo'); // 下载并提取git仓库，用于下载项目模板
const handlebars = require('handlebars'); // 模板引擎，将用户提交的信息动态填充到文件中
const inquirer = require('inquirer'); // 通用的命令行，用于和用户进行交互
const ora = require('ora'); // 显示下载中的动画效果
const chalk = require('chalk'); // 给终端的字体添加样式
const symbols = require('log-symbols'); // 终端上显示出 √ 或 × 等的图标

program.version('1.0.0', '-v, --version')
	.command('init <name>')
    .action((name) => {
        if(!fs.existsSync(name)){
            inquirer.prompt([
                {
					name: 'description',
					message: 'Please enter a description of the project'
				},
				{
					name: 'author',
					message: 'Please enter the author name'
                },
                {
                    name: 'template',
                    message: 'Do you use React(Y/N)?'
                }
            ]).then((answers) => {
                // 下载loading动画
                const spinner = ora('正在下载模板...');
                spinner.start();

                // 是否使用react模板
                let gitUrl = 'github:bear-new/webpack-template#master';
                if (answers.template.toUpperCase() === 'Y') {
                    gitUrl = 'github:bear-new/react-webpack-template#master';
                }

				download(gitUrl, name, {clone: true}, err => {
                    if(err){
                        spinner.fail();
                        console.log(symbols.error, chalk.red(err));
                    }else{
                        spinner.succeed();
                        const fileName = `${name}/package.json`;
                        const meta = {
                            name,
                            description: answers.description,
                            author: answers.author
                        }
                        if(fs.existsSync(fileName)){
                            const content = fs.readFileSync(fileName).toString();
                            const result = handlebars.compile(content)(meta);
                            fs.writeFileSync(fileName, result);
                        }
                        console.log(symbols.success, chalk.green('项目初始化完成'));
                    }
                })
            })
        }else{
            // 错误提示项目已存在，避免覆盖原有项目
            console.log(symbols.error, chalk.red('项目已存在'));
        }
    })
program.parse(process.argv);
