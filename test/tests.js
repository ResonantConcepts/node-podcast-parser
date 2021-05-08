const path   = require('path');
const fs     = require('fs');
const expect = require('expect.js');
const parse  = require('./../index');

describe('Podcast feed parser', () => {

  const fixtures = {};

  before(function(done) {
    const fixturePath = path.join(__dirname, 'fixtures');
    fs.readdir(fixturePath, (err, files) => {
      if (err) {
        return done(err);
      }

      files
        .filter(name => fs.statSync(path.join(fixturePath, name)).isFile())
        .forEach(name => {
          var fileContent;
          try {
            fileContent = fs.readFileSync(path.join(fixturePath, name)).toString();
          } catch (readError) {
            done(readError);
            return;
          }

          fixtures[name.substr(0, name.indexOf('.'))] = fileContent;
        });

      done();
    });
  });

  it('should return expected format', function(done) {
    parse(fixtures['apple-example'], (err, data) => {
      if (err) {
        return done(err);
      }

      expect(data).to.have.property('title');
      expect(data).to.have.property('link');
      expect(data).to.have.property('language');
      expect(data).to.have.property('description');
      expect(data.description).to.have.property('short');
      expect(data.description).to.have.property('long');
      expect(data).to.have.property('image');
      expect(data).to.have.property('categories');
      expect(data).to.have.property('author');
      expect(data).to.have.property('owner');
      expect(data).to.have.property('updated');
      expect(data).to.have.property('explicit');
      expect(data).to.have.property('episodes');

      expect(data.title).to.be.a('string');
      expect(data.link).to.be.a('string');
      expect(data.language).to.be.a('string');
      expect(data.description.short).to.be.a('string');
      expect(data.description.long).to.be.a('string');
      expect(data.image).to.be.a('string');
      expect(data.explicit).to.be.a('boolean');
      expect(data.categories).to.be.an(Array);
      expect(data.updated).to.be.a(Date);
      expect(data.episodes).to.be.an(Array);
      expect(data.author).to.be.a('string');

      expect(data.owner).to.have.property('name');
      expect(data.owner).to.have.property('email');

      const episode = data.episodes[0];
      expect(episode).to.have.property('guid');
      expect(episode).to.have.property('title');
      expect(episode).to.have.property('description');
      expect(episode).to.have.property('published');
      expect(episode).to.have.property('image');
      expect(episode).to.have.property('duration');
      expect(episode).to.have.property('explicit');
      expect(episode).to.have.property('enclosure');

      expect(episode.guid).to.be.a('string');
      expect(episode.title).to.be.a('string');
      expect(episode.description).to.be.a('string');
      expect(episode.published).to.be.a(Date);
      expect(episode.image).to.be.a('string');
      expect(episode.explicit).to.be.a('boolean');
      expect(episode.duration).to.be.a('number');

      expect(episode.enclosure).to.have.property('filesize');
      expect(episode.enclosure).to.have.property('type');
      expect(episode.enclosure).to.have.property('url');

      done();
    });
  });

  it('should parse apple feed', function(done) {
    parse(fixtures['apple-example'], (err, data) => {
      if (err) {
        return done(err);
      }

      const podcast = Object.assign({}, data);
      delete podcast.episodes;

      expect(podcast).to.eql({
        title: 'All About Everything',
        description: {
          short: 'A show about everything',
          long: 'All About Everything is a show about everything. Each week we dive into any subject known to man and talk about it as much as we can. Look for our podcast in the Podcasts app or in the iTunes Store',
        },
        links: [
          'http://www.example.com/podcasts/everything/index.html'
        ],
        image: 'http://example.com/podcasts/everything/AllAboutEverything.jpg',
        language: 'en-us',
        updated: utcDate(2014, 5, 15, 19, 0, 0),
        author: 'John Doe',
        owner: {
          name: 'John Doe',
          email: 'john.doe@example.com'
        },
        explicit: true,
        categories: [
          'Technology>Gadgets',
          'TV & Film',
        ]
      });

      expect(data.episodes).to.have.length(3);
      const firstEpisode = data.episodes[0];
      delete firstEpisode.description;

      expect(firstEpisode).to.eql({
        guid: 'http://example.com/podcasts/archive/aae20140615.m4a',
        title: 'Shake Shake Shake Your Spices',
        published: utcDate(2014, 5, 15, 19, 0, 0),
        image: 'http://example.com/podcasts/everything/AllAboutEverything/Episode1.jpg',
        duration: 424,
        explicit: false,
        links: [
          'https://itunes/apple.com/us/book/antique-trader-salt-pepper/id429691295?mt=11'
        ],
        enclosure: {
          filesize: 8727310,
          type: 'audio/x-m4a',
          url: 'http://example.com/podcasts/everything/AllAboutEverythingEpisode3.m4a'
        }
      });

      done();
    });
  });

  it('should parse javascript air feed', function(done) {
    parse(fixtures['javascript-air'], (err, data) => {
      if (err) {
        return done(err);
      }

      const podcast = Object.assign({}, data);
      delete podcast.episodes;

      expect(podcast).to.eql({
        title: 'JavaScript Air',
        description: {
          short: 'The live broadcast podcast all about JavaScript',
          long: 'The live broadcast podcast all about JavaScript and the Web',
        },
        links: [
          'http://javascriptair.podbean.com/'
        ],
        image: 'http://imglogo.podbean.com/image-logo/862611/2048.png',
        language: 'en-us',
        updated: utcDate(2016, 0, 28, 0, 21, 35),
        ttl: 1440,
        author: 'Kent C. Dodds',
        owner: {
          name: 'Kent C. Dodds',
          email: 'javascriptair@gmail.com'
        },
        explicit: false,
        categories: [
          'Technology>Podcasting'
        ]
      });

      expect(data.episodes).to.have.length(8);
      const firstEpisode = data.episodes[0];
      delete firstEpisode.description;

      expect(firstEpisode).to.eql({
        guid: 'http://audio.javascriptair.com/e/007-jsair-chakra-microsofts-open-source-javascript-engine-with-ed-maurer-gaurav-seth-and-steve-lucco/',
        contentEncoded: '<div>\n          <div>\n            <span>\n              <a href="http://javascriptair.com/episodes/2016-01-27">Chakra, Microsoft’s Open Source JavaScript Engine</a>\n              with\n              <span>\n                <a href="https://twitter.com/undefined">Ed Maurer</a>\n                ,\n                <a href="https://twitter.com/gauravseth">Gaurav Seth</a>\n                , and\n                <a href="https://twitter.com/undefined">Steve Lucco</a></span>\n            </span>\n          </div>\n          <div>\n            <strong>Description:</strong>\n            <span/>\n            <p>Microsoft has been making some pretty awesome\nmoves in the world of open source recently.\nAt JSConf in early December, it was announced that\nChakra, Microsoft’s JavaScript Engine\nthat powers the Microsoft Edge browser\n(with better support for ES6 than babel or Chrome),\nwill be open sourced. Join us as we talk about\nChakra with some of the subject matter experts!</p>\n          </div>\n          <div>\n            <strong>Show sponsors:</strong>\n            <ul>\n              <li>\n                <a href="http://jsair.io/eggheadio">Egghead.io</a>- Bite-sized web development video training</li>\n              <li>\n                <a href="http://jsair.io/frontendmasters">Frontend Masters</a>- Expert front-end training</li>\n              <li>\n                <a href="http://jsair.io/trackjs">{Track:js}</a>- JavaScript Error Monitoring</li>\n              <li>\n                <a href="http://jsair.io/wallabyjs">Wallaby.js</a>- Realtime code coverage</li>\n              <li>\n                <a href="http://jsair.io/codecov">Codecov.io</a>- Code coverage done right</li>\n            </ul>\n          </div>\n          <div>\n            <strong>Links, Picks, and Tips:</strong>\n            <div>\n              <a href="https://twitter.com/undefined">Ed Maurer</a>\n              <ul>\n                <li>Tips:\n                  <span>\n                    Check out\n                    <a href="http://www.typescriptlang.org/">TypeScript</a></span>\n                </li>\n                <li>Picks:\n                  <span>\n                    <a href="http://www.juliashammasholter.com/">Julia Holter</a>\n                    album -\n                    <a href="http://www.amazon.com/Have-You-In-My-Wilderness/dp/B011DHCNTE">Have You in my Wilderness</a></span>\n                </li>\n              </ul>\n            </div>\n            <div>\n              <a href="https://twitter.com/gauravseth">Gaurav Seth</a>\n              <ul>\n                <li>Tips:\n                  <span>\n                    We’re new to open source, but we’d love to hear your feedback (\n                    <a href="https://github.com/Microsoft/ChakraCore">ChakraCore</a>\n                    )!</span>\n                </li>\n              </ul>\n            </div>\n            <div>\n              <a href="https://twitter.com/undefined">Steve Lucco</a>\n              <ul>\n                <li>Tips:\n                  <span>Use the web programming model for as much as we can</span></li>\n                <li>Picks:\n                  <span>\n                    <a href="http://electron.atom.io/">Electron</a></span>\n                </li>\n              </ul>\n            </div>\n            <div>\n              <a href="https://twitter.com/drboolean">Brian Lonsdorf</a>\n              <ul>\n                <li>Picks:\n                  <span>\n                    <a href="https://github.com/yelouafi/redux-saga">Redux Saga</a>\n                    ,\n                    <a href="https://github.com/fantasyland/fantasy-frees">Simon Richardson’s Free Monad implementation</a>\n                    , and\n                    <a href="https://vimeo.com/98096838">Brian McKenna on fantasyland</a></span>\n                </li>\n              </ul>\n            </div>\n            <div>\n              <a href="https://twitter.com/getify">Kyle Simpson</a>\n              <ul>\n                <li>Picks:\n                  <span>\n                    <a href="http://v8project.blogspot.com/2016/01/v8-release-49.html">v8 gets ES6!</a>\n                    ,\n                    <a href="http://www.heydonworks.com/article/developer-fallacies">Developer Fallacies</a>\n                    by\n                    <a href="http://twitter.com/heydonworks">@heydonworks</a>\n                    , and\n                    <a href="http://www.ember-cli-mirage.com/">Ember-CLI-Mirage</a></span>\n                </li>\n              </ul>\n            </div>\n            <div>\n              <a href="https://twitter.com/kentcdodds">Kent C. Dodds</a>\n              <ul>\n                <li>Links:\n                  <span>\n                    <a href="http://jsair.io/wallabyjs-sublime">Wallaby.js Sublime Plugin</a>\n                    and\n                    <a href="https://medium.com/@kentcdodds/what-open-source-project-should-i-contribute-to-7d50ecfe1cb4">What open source project should I contribute to?</a></span>\n                </li>\n                <li>Tips:\n                  <span>Get involved open source</span></li>\n                <li>Picks:\n                  <span>\n                    <a href="https://glebbahmutov.com/blog/better-hacker/">How to become a better hacker</a>\n                    by\n                    <a href="https://twitter.com/bahmutov">Gleb Bahmutov</a></span>\n                </li>\n              </ul>\n            </div>\n            <div>\n              <a href="https://twitter.com/linclark">Lin Clark</a>\n              <ul>\n                <li>Links:\n                  <span>\n                    <a href="https://code-cartoons.com/">Code Cartoons series on Relay</a></span>\n                </li>\n                <li>Picks:\n                  <span>\n                    <a href="http://calendar.perfplanet.com/2013/diff/">React’s diff algorithm</a></span>\n                </li>\n              </ul>\n            </div>\n            <div>\n              <a href="https://twitter.com/pamasaur">Pam Selle</a>\n              <ul>\n                <li>Picks:\n                  <span>\n                    <a href="https://github.com/higgsjs/Higgs">Higgs JavaScript VM</a></span>\n                </li>\n              </ul>\n            </div>\n          </div>\n          <div>\n            <strong>About JavaScript Air:</strong>\n            <div>\n              <span>\n                <a href="http://javascriptair.com">JavaScriptAir</a>is the live broadcast podcast all about JavaScript hosted by\n                <a href="https://egghead.io/instructors/kentcdodds">egghead.io instructor</a>\n                <a href="https://twitter.com/kentcdodds">Kent C. Dodds</a>\n                . Please visit the JavaScript Air website (\n                <a href="http://javascriptair.com">javascriptair.com</a>\n                ) to see upcoming and past episodes. Also be sure to follow JavaScript Air on\n                <a href="https://twitter.com/JavaScriptAir">Twitter</a>\n                and\n                <a href="https://plus.google.com/105493143005968326308">Google+</a>\n                to stay up to date with future episodes. Also, all episodes are on the\n                <a href="http://video.javascriptair.com">YouTube</a>\n                channel as well.</span>\n            </div>\n          </div>\n        </div>',
        links: 
   [ 'http://javascriptair.com/episodes/2016-01-27',
     'https://twitter.com/undefined',
     'https://twitter.com/gauravseth',
     'https://twitter.com/undefined',
     'http://jsair.io/eggheadio',
     'http://jsair.io/frontendmasters',
     'http://jsair.io/trackjs',
     'http://jsair.io/wallabyjs',
     'http://jsair.io/codecov',
     'https://twitter.com/undefined',
     'http://www.typescriptlang.org/',
     'http://www.juliashammasholter.com/',
     'http://www.amazon.com/Have-You-In-My-Wilderness/dp/B011DHCNTE',
     'https://twitter.com/gauravseth',
     'https://github.com/Microsoft/ChakraCore',
     'https://twitter.com/undefined',
     'http://electron.atom.io/',
     'https://twitter.com/drboolean',
     'https://github.com/yelouafi/redux-saga',
     'https://github.com/fantasyland/fantasy-frees',
     'https://vimeo.com/98096838',
     'https://twitter.com/getify',
     'http://v8project.blogspot.com/2016/01/v8-release-49.html',
     'http://www.heydonworks.com/article/developer-fallacies',
     'http://twitter.com/heydonworks',
     'http://www.ember-cli-mirage.com/',
     'https://twitter.com/kentcdodds',
     'http://jsair.io/wallabyjs-sublime',
     'https://medium.com/@kentcdodds/what-open-source-project-should-i-contribute-to-7d50ecfe1cb4',
     'https://glebbahmutov.com/blog/better-hacker/',
     'https://twitter.com/bahmutov',
     'https://twitter.com/linclark',
     'https://code-cartoons.com/',
     'http://calendar.perfplanet.com/2013/diff/',
     'https://twitter.com/pamasaur',
     'https://github.com/higgsjs/Higgs',
     'http://javascriptair.com',
     'https://egghead.io/instructors/kentcdodds',
     'https://twitter.com/kentcdodds',
     'http://javascriptair.com',
     'https://twitter.com/JavaScriptAir',
     'https://plus.google.com/105493143005968326308',
     'http://video.javascriptair.com' ],
        title: '007 jsAir - Chakra, Microsoft’s Open Source JavaScript Engine with Ed Maurer, Gaurav Seth, and Steve Lucco',
        published: utcDate(2016, 0, 28, 0, 21, 35),
        // no image
        explicit: false,
        duration: 3550,
        enclosure: {
          filesize: 56787979,
          type: 'audio/mpeg',
          url: 'http://javascriptair.podbean.com/mf/feed/dk3eif/JavaScriptAirEpisode007-ChakraMicrosoftsOpenSourceJavaScriptEngine.mp3'
        },
        explicit: false,
        categories: [
          'Uncategorized'
        ]
      });

      done();
    });
  });

  it('should parse scale your code feed', function(done) {
    parse(fixtures['scale-your-code'], (err, data) => {
      if (err) {
        return done(err);
      }

      const podcast = Object.assign({}, data);
      delete podcast.episodes;

      expect(podcast).to.eql({
        title: 'Scale Your Code Podcast',
        description: {
          short: 'Interviews of proven developers',
          long: 'Learn from proven developers through interviews.',
        },
        links: [
          'https://scaleyourcode.com/'
        ],
        image: 'http://d1ngwfo98ojxvt.cloudfront.net/public/itunes/cover_art.jpg',
        language: 'en-us',
        updated: utcDate(2016, 1, 2, 1, 5, 26),
        author: 'Christophe Limpalair',
        owner: {
          name: 'Christophe Limpalair',
          email: 'chris@scaleyourcode.com'
        },
        explicit: true,
        categories: [
          'Technology'
        ]
      });

      expect(data.episodes).to.have.length(23);
      const firstEpisode = data.episodes[0];
      delete firstEpisode.description;

      expect(firstEpisode).to.eql({
        guid: 'https://d1ngwfo98ojxvt.cloudfront.net/public/mp3/interviews/jack_levin_23.mp3',
        title: 'Large scale image processing on the fly in 25ms with Google\'s first Network Engineer',
        published: utcDate(2016, 1, 2, 1, 5, 26),
        image: 'https://d1ngwfo98ojxvt.cloudfront.net/images/interviews/jack_levin/jack-levin_opt_hi.jpg',
        links: [],
        // no explicit
        // no duration
        enclosure: {
          filesize: undefined, // filesize not set
          type: 'audio/x-mp3',
          url: 'https://d1ngwfo98ojxvt.cloudfront.net/public/mp3/interviews/jack_levin_23.mp3'
        },
        // no categories
      });

      done();
    });
  });

  it('should parse rtve-podcast feed', function(done) {
    parse(fixtures['rtve-podcast'], (err, data) => {
      if (err) {
        return done(err);
      }

      const podcast = Object.assign({}, data);
      delete podcast.episodes;

       expect(podcast).to.eql({
         title: 'Tiempo de valientes. El diario de Julián Martínez',
        description: {
          long: 'Al final del capítulo 9 de El Ministerio del Tiempo, vimos a Julián Martínez huir del ministerio por una puerta. ¿Qué sucedió con él? ¿Volverá? Descúbrelo en el diario sonoro de Julián Martínez en Cuba, la ficción sonora de RTVE.ES, Radio Nacional, Onza Entertainment y Cliffhanger TV protagonizada por Rodolfo Sancho.',
        },
        links: [
          'http://www.rtve.es/alacarta/audios/tiempo-de-valientes-el-diario-de-julian-martinez/'
        ],
        image: 'http://img.rtve.es/imagenes/tiempo-valientes-diario-julian-martinez/1455556336980.jpg',
        language: 'es-es',
        updated: utcDate(2016, 4, 17, 12, 08, 49),
        owner: {

        },
        explicit: false,
        categories: [
        ]
      });

      done();
    });
  });


  it('should parse se-radio feed', function(done) {
    parse(fixtures['se-radio'], (err, data) => {
      if (err) {
        return done(err);
      }

      const podcast = Object.assign({}, data);
      delete podcast.episodes;

      expect(podcast).to.eql({
        title: 'Software Engineering Radio - The Podcast for Professional Software Developers',
        description: {
          short: 'Information for Software Developers and Architects',
          long: 'Software Engineering Radio is a podcast targeted at the professional software developer. The goal is to be a lasting educational resource, not a newscast. Every 10 days, a new episode is published that covers all topics software engineering. Episodes are either tutorials on a specific topic, or an interview with a well-known character from the software engineering world. All SE Radio episodes are original content — we do not record conferences or talks given in other venues. Each episode comprises two speakers to ensure a lively listening experience. SE Radio is an independent and non-commercial organization. All content is licensed under the Creative Commons 2.5 license.',
        },
        links: [
          'http://www.se-radio.net/'
        ],
        image: 'http://media.computer.org/sponsored/podcast/se-radio/se-radio-logo-1400x1475.jpg',
        language: 'en-us',
        updated: utcDate(2016, 0, 28, 18, 6, 52),
        author: 'SE-Radio Team',
        owner: {
          name: 'SE-Radio Team',
          email: 'team@se-radio.net'
        },
        explicit: false,
        categories: [
          'Technology>Software How-To'
        ],
        explicit: false,
      });

      expect(data.episodes).to.have.length(249);
      const firstEpisode = data.episodes[0];
      delete firstEpisode.description;

      expect(firstEpisode).to.eql({
        guid: 'http://www.se-radio.net/?p=1939',
        title: 'SE-Radio Episode 248: Axel Rauschmayer on JavaScript and ECMAScript 6',
        published: utcDate(2016, 0, 28, 18, 6, 52),
        image: 'http://media.computer.org/sponsored/podcast/se-radio/se-radio-logo-1400x1475.jpg',
        explicit: false,
        duration: 3793,
        enclosure: {
          filesize: 151772209,
          type: 'audio/mpeg',
          url: 'http://feedproxy.google.com/~r/se-radio/~5/_V8a9ATpdxk/SE-Radio-Episode-248-Axel-Rauschmayer-on-JavaScript-and-ECMAScript-6.mp3'
        },
        links: [ 
          'http://www.se-radio.net/wp-content/uploads/2016/01/axel_rauschmayer100x125.jpg',
          'http://www.se-radio.net/2015/06/episode-230-shubhra-khar-on-nodejs/',
          'https://brendaneich.com/',
          'https://en.wikipedia.org/wiki/ECMAScript#Versions',
          'http://www.se-radio.net/2008/08/episode-108-simon-peyton-jones-on-functional-programming-and-haskell/',
          'http://www.w3.org/TR/workers/',
          'http://www.ecma-international.org/publications/standards/Ecma-262.htm',
          'http://asmjs.org/',
          'https://www.w3.org/community/webassembly/',
          'http://www.commonjs.org/',
          'https://github.com/amdjs/amdjs-api/blob/master/AMD.md',
          'https://kangax.github.io/compat-table/es6/',
          'https://babeljs.io/',
          'http://speakingjs.com',
          'http://exploringjs.com/',
          'http://www.2ality.com',
          'http://ecmanauten.de'
        ],
        explicit: false,
        categories: [
          'Episodes',
          'ECMAScript',
          'JavaScript'
        ]
      });

      done();
    });
  });

  it('should parse design details feed', function(done) {
    parse(fixtures['design-details'], (err, data) => {
      if (err) {
        return done(err);
      }

      const podcast = Object.assign({}, data);
      delete podcast.episodes;

      expect(podcast).to.eql({
        title: 'Design Details',
        description: {
          short: 'A show about the people who design our favorite products.',
          long: 'A show about the people who design our favorite products. Hosted by Bryn Jackson and Brian Lovin.',
        },
        links: [
          'http://spec.fm/show/design-details'
        ],
        image: 'https://media.simplecast.com/podcast/image/1034/1452553074-artwork.jpg',
        language: 'en-us',
        updated: utcDate(2016, 1, 1, 13, 0, 0),
        author: 'Spec',
        owner: {
          name: 'Spec.FM',
          email: 'designdetailsfm@gmail.com'
        },
        explicit: false,
        categories: [
          'Technology',
          'Arts>Design',
          'Technology>Podcasting'
        ]
      });

      expect(data.episodes).to.have.length(102);
      const firstEpisode = data.episodes[0];
      delete firstEpisode.description;

      expect(firstEpisode).to.eql({
        guid: 'ea43eba3-3a9e-4593-a69b-1a78465d9e76',
        contentEncoded: '<p>Episode 100! We made it - thank you so much to everyone has listened to an episode, shared the show with a friend or reached out to us on Twitter this past year; we wouldn\'t be here without you. For this special episode we caught up with Daniel Burka to talk about his background, process, critique, what keeps him up at night and more. Enjoy!</p>\n\n<p>Come chat with us in our new <a href="http://spec.fm/slack">Slack team</a>! Over 3,000 designers and developers have already joined our team, chatting about the latest tools and news in the design world. Each week we also host a community critique with a special guest host. To join our team visit our <a href="http://spec.fm/slack">Slack invite page</a> and we\'ll send you an invitation!</p>\n\n<h5>Daniel on the Web:</h5>\n\n<ul>\n<li><a href="https://twitter.com/dburka">Twitter</a></li>\n<li><a href="http://www.deltatangobravo.com/">Website</a></li>\n<li><a href="https://www.instagram.com/dburka/">Instagram</a></li>\n<li><a href="http://www.gv.com/team/daniel-burka/">GV Profile</a></li>\n<li><a href="https://medium.com/@dburka">Medium</a></li>\n</ul>\n\n\n<h5>Show Notes:</h5>\n\n<ul>\n<li><a href="http://www.gv.com/">GV</a></li>\n<li><a href="http://www.designweek.co.uk/google-ventures-rebrands-as-gv/">Google Ventures Rebrand</a></li>\n<li><a href="https://dribbble.com/dburka">Dribbble</a></li>\n<li><a href="https://twitter.com/ireneau">Irene Au</a></li>\n<li><a href="https://twitter.com/johnmaeda">John Maeda</a></li>\n<li><a href="https://twitter.com/erondu">Jared Erondu</a></li>\n<li><a href="http://www.gv.com/team/">GV Design Team</a></li>\n<li><a href="http://www.silverorange.com/">silverorange</a></li>\n<li><a href="http://www.hicksdesign.co.uk/journal/branding-firefox">Jon Hicks on Firefox Branding</a></li>\n<li><a href="https://twitter.com/kevinrose">Kevin Rose</a></li>\n<li><a href="https://en.wikipedia.org/wiki/Pownce">Pownce</a></li>\n<li><a href="https://twitter.com/stewart">Stewart Butterfield</a></li>\n<li><a href="https://slack.com/">Slack</a></li>\n<li><a href="http://money.cnn.com/2012/03/20/technology/startups/Google-Digg-Milk/">Milk acquisition</a></li>\n<li><a href="http://www.gv.com/sprint/">Sprint Book</a></li>\n<li><a href="http://www.fastcodesign.com/1672889/from-google-ventures-the-6-ingredients-you-need-to-run-a-design-sprint">Design sprints how-to</a></li>\n</ul>',
        links: [
          'http://spec.fm/slack',
          'http://spec.fm/slack',
          'https://twitter.com/dburka',
          'http://www.deltatangobravo.com/',
          'https://www.instagram.com/dburka/',
          'http://www.gv.com/team/daniel-burka/',
          'https://medium.com/@dburka',
          'http://www.gv.com/',
          'http://www.designweek.co.uk/google-ventures-rebrands-as-gv/',
          'https://dribbble.com/dburka',
          'https://twitter.com/ireneau',
          'https://twitter.com/johnmaeda',
          'https://twitter.com/erondu',
          'http://www.gv.com/team/',
          'http://www.silverorange.com/',
          'http://www.hicksdesign.co.uk/journal/branding-firefox',
          'https://twitter.com/kevinrose',
          'https://en.wikipedia.org/wiki/Pownce',
          'https://twitter.com/stewart',
          'https://slack.com/',
          'http://money.cnn.com/2012/03/20/technology/startups/Google-Digg-Milk/',
          'http://www.gv.com/sprint/',
          'http://www.fastcodesign.com/1672889/from-google-ventures-the-6-ingredients-you-need-to-run-a-design-sprint'
        ],
        title: '100: Goldilocks Fidelity (feat. Daniel Burka)',
        published: utcDate(2016, 1, 1, 13, 0, 0),
        image: 'https://media.simplecast.com/episode/image/25164/1454282072-artwork.jpg',
        duration: 3932,
        explicit: true,
        enclosure: {
          filesize: 62948884,
          type: 'audio/mpeg',
          url: 'https://audio.simplecast.com/25164.mp3'
        },
        // no categories
      });

      done();
    });
  });

  it('should parse neo4j feed', function(done) {
    parse(fixtures['neo4j'], (err, data) => {
      if (err) {
        return done(err);
      }

      const podcast = Object.assign({}, data);
      delete podcast.episodes;

      expect(podcast).to.eql({
        title: 'Podcast on Graph Databases and Neo4j',
        description: {
          short: 'Podcast by The Neo4j Graph Database Community',
          long: 'Podcast by The Neo4j Graph Database Community',
        },
        links: [
          'http://blog.bruggen.com/'
        ],
        image: 'http://i1.sndcdn.com/avatars-000135096101-qekfg1-original.png',
        language: 'en-us',
        ttl: 60,
        updated: utcDate(2016, 0, 29, 8, 44, 0),
        author: 'The Neo4j Graph Database Community',
        owner: {
          name: 'Graphistania',
          email: 'rik@neotechnology.com'
        },
        explicit: false,
        categories: [
          'Technology'
        ],
        explicit: false,
      });

      expect(data.episodes).to.have.length(54);
      const firstEpisode = data.episodes[0];
      delete firstEpisode.description;

      expect(firstEpisode).to.eql({
        guid: 'tag:soundcloud,2010:tracks/244374452',
        title: 'Podcast Interview With Stuart Begg And Matt Byrne, Independent Contractors at Sensis',
        published: utcDate(2016, 0, 29, 0, 0, 0),
        image: 'http://i1.sndcdn.com/avatars-000135096101-qekfg1-original.png',
        links: [],
        explicit: false,
        duration: 638,
        enclosure: {
          filesize: 6381794,
          type: 'audio/mpeg',
          url: 'http://www.podtrac.com/pts/redirect.mp3/feeds.soundcloud.com/stream/244374452-graphistania-podcast-recording-with-stuart-begg-and-matt-byrne-independent-contractors-at-sensis.mp3'
        },
        // no categories
      });

      done();
    });
  });

  it('should parse iOS 11 feeds from coding blocks', function(done) {
    parse(fixtures['coding-blocks'], (err, data) => {
      if (err) {
        return done(err);
      }

      const podcast = Object.assign({}, data);
      delete podcast.episodes;

      expect(podcast).to.eql({
        categories: [],
        title: 'Coding Blocks Podcast',
        description: {
          long: 'The world of computer programming is vast in scope. There are literally thousands of topics to cover and no one person could ever reach them all. One of the goals of the Coding Blocks podcast is to introduce a number of these topics to the audience so they can learn during their commute or while cutting the grass. We will cover topics such as best programming practices, design patterns, coding for performance, object oriented coding, database design and implementation, tips, tricks and a whole lot of other things. You\'ll be exposed to broad areas of information as well as deep dives into the guts of a programming language. While Microsoft.NET is the development platform we\'re using, most topics discussed are relevant in any number of Object Oriented programming languages. We are all web and database programmers and will be providing useful information on a full spectrum of technologies and are open to any suggestions anyone might have for a topic. So please join us, subscribe, and invite your computer programming friends to come along for the ride.',
        },
        links: [
          'http://www.codingblocks.net/'
        ],
        language: 'en-us',
        image: 'https://ssl-static.libsyn.com/p/assets/4/d/e/0/4de099a806af9ddd/1400x1400bb.jpg',
        explicit: false,
        updated: utcDate(2018, 5, 11, 1, 20, 48),
        type: 'episodic',
      });

      expect(data.episodes).to.have.length(83);
      const firstEpisode = data.episodes[0];
      delete firstEpisode.description;

      expect(firstEpisode).to.eql({
        title: 'Search Driven Apps',
        published: utcDate(2018, 5, 11, 1, 20, 48),
        guid: 'c964777d603943dab53f36ccc17a742e',
        image: 'https://ssl-static.libsyn.com/p/assets/2/e/a/d/2ead1e2293797364/Coding_Blocks_-_Blockhead_Chipping.jpeg',
        links: [],
        contentEncoded: '<p>We\'re talking databases, indexes, search engines, and why they\'re basically microwaves in this episode while Joe wears a polo, Allen\'s quick brown fox jumps over whatever, and Michael gives out fake URLs.</p>',
        enclosure:
        {
          filesize: 66692288,
          type: 'audio/mpeg',
          url: 'https://traffic.libsyn.com/secure/codingblocks/coding-blocks-episode-83.mp3?dest-id=171666'
        },
        duration: 8318,
        explicit: false,
        season: "1",
        episode: "83",
        episodeType: 'full',
      });

      done();
    });
  });

  it('should parse libsyn example feed episode', function(done) {
    parse(fixtures['libsyn-example-podcast'], (err, data) => {
      if (err) {
        return done(err);
      }

      const podcast = Object.assign({}, data);

      const firstEpisode = data.episodes[0];

      expect(firstEpisode).to.eql({
        guid: '1bdba530eb7cd0fb6241a945fda4db95',
        title: 'Episode 128',
        description: '<p>Frank and Erik travel the world.</p> <p>Outro: 20/20 - Yellow Pills</p> <p>646-434-8528</p> <p>frankanderik.com</p>',
        contentEncoded: "<p>Frank and Erik travel the world.</p> <p>Outro: 20/20 - Yellow Pills</p> <p>646-434-8528</p> <p>frankanderik.com</p>",
        links: [],
        published: utcDate(2017, 3, 21, 3, 12, 13),
        image: 'http://static.libsyn.com/p/assets/0/a/0/1/0a015c5ace601833/InternetFamousArt.jpg',
        explicit: false,
        duration: 5702,
        enclosure: {
          filesize: 45813708,
          type: 'audio/mpeg',
          url: 'http://traffic.libsyn.com/frankanderik/Internet_Famous_Ep128.mp3?dest-id=30697'
        },
        // no categories
      });

      done();
    });
  });

  it('should parse isExplicit', function(done) {
    parse(fixtures['libsyn-example-podcast'], (err, data) => {
      if (err) {
        return done(err);
      }
      const podcast = Object.assign({}, data);
      const firstEpisode = data.episodes[0];

      expect(podcast.explicit).to.equal(true);
      expect(firstEpisode.explicit).to.equal(false);

      done();
    });
  });

  it('should parse complex genres', function(done) {
    parse(fixtures['complex-genre'], (err, data) => {
      if (err) {
        return done(err);
      }

      expect(data.categories).to.eql([
        'A>A1',
        'A>A1>A11',
        'A>A1>A11>A111',
        'A>A2',
        'B>B1',
        'B>B2',
        'B>B2>B21'
      ]);

      done();
    });
  });

  it('should call callback', function(done) {
    parse(fixtures['apple-example'], (err) => {
      if (!err) {
        return done(err);
      }

      done();
    });
  });

  it('should callback with error', function(done) {
    parse('invalid xml', (err) => {
      if (err) {
        return done();
      }

      done('Error was not set');
    });
  });
});

// -----------------------------------------------------
//
// Helpers

function utcDate(year, month, day, hour, minute, second) {
  return new Date(Date.UTC(year, month, day, hour, minute, second));
}
