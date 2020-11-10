const path = require('path');
const fs = require('fs');
const _ = require('lodash');
const execa = require('execa');

const PAGE_FILE = path.resolve(__dirname, '../pages/index.js');

main(process.argv.slice(2)[0]);

async function main(moduleName) {
  if (!moduleName) {
    console.log('No module');
    return;
  }
  console.log(`Module name: ${moduleName}`);

  console.log('Reading page file');
  let fileContent = fs.readFileSync(PAGE_FILE, { encoding: 'utf-8' });

  console.log('Listing versions of module');
  const { stdout } = await execa.command(`yarn info ${moduleName} versions --json`);
  const moduleVersions = JSON.parse(stdout).data;

  console.log('Preparing new versions of module and new page file');
  const depsToInstall = [];
  for (const version of moduleVersions) {
    const aliasModuleName = `${moduleName}-${version}`;
    const moduleSpecifier = _.camelCase(aliasModuleName);
    const importStatement = `import ${moduleSpecifier} from '${aliasModuleName}';\n`;
    const logCall = `console.log('${aliasModuleName}', ${moduleSpecifier}.version);\n`;
    if (!fileContent.includes(importStatement)) {
      depsToInstall.push(`${aliasModuleName}@npm:${moduleName}@${version}`);
      fileContent = importStatement + fileContent;
    }
    if (!fileContent.includes(logCall)) {
      fileContent = fileContent + logCall;
    }
  }

  if (depsToInstall.length > 0) {
    console.log('Installing all versions of module as alias');
    await execa.command(`yarn add ${depsToInstall.join(' ')}`);

    console.log('Updating page file');
    fs.writeFileSync(PAGE_FILE, fileContent);
  } else {
    console.log('No changes to node modules or page file');
  }
}
