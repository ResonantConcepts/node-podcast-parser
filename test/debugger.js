const path   = require('path');
const fs     = require('fs');
const parse  = require('./../src/index');

const run = () => {
  try {
    const testContent = fs.readFileSync(path.join(__dirname, './fixtures/landofgiants.xml')).toString();
    const hideEpisodes = false;
    const hideDescription = true;
    const hideCategories = true;

    parse(testContent, (err, data) => {
      if (hideEpisodes) {
        delete data.episodes;
      }
      if (hideDescription) {
        delete data.description;
      }
      if (hideCategories) {
        delete data.categories;
      }
      console.info(data)
    })

  } catch (error) {
    console.error(error)
  }
}

run()