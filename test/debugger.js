const path = require('path');
const fs = require('fs');
const parse = require('./../src/index');

const run = () => {
  try {
    const testContent = fs.readFileSync(path.join(__dirname, './fixtures/blatering.xml')).toString();
    const hideEpisodes = false;
    const hideDescription = false;
    const hideCategories = false;

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
      //not a problem if the console prints [Array] or [Object].
      //to see it's content just use JSON.stringify
      console.info(data.episodes[0])
      // console.info(data)

      //check only links of each episode
      //console.info(data.episodes.map((item) => item.links))
    })

  } catch (error) {
    console.error(error)
  }
}

run()