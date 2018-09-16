const RSS = require('rss');
const path = require('path');
const fs = require('fs');
const chalk = require('chalk');
const striptags = require('striptags');
module.exports = {
  apply(){
    cogear.on('build.done',()=>{
      // if(!['production','build','deploy'].includes(cogear.mode)) return;
      const config = Object.assign({},cogear.config.feed,{
        title: cogear.config.title,
        description: cogear.config.description,
        generator: 'Cogear.JS plugin blog-rss',
        feed_url: path.join(cogear.config.url || '/','rss.xml'),
        site_url: cogear.config.url,
        image_url: '',
        language: 'en',
        image: '',
        author: ''
      });
      const feed = new RSS(config);
      if(cogear.blog.posts.length){
        cogear.blog.posts.forEach(post=>{
          let img_url = '';
          let matches = post.content.match('(https?:\/\/.+\.(?:jpg|png))');
          if(matches){
            img_url = matches.shift();
          }
          feed.item({
            title: post.title,
            description: striptags(post.teaser,['a','b','strong','i','em','u','strikethrough','p','div']),
            url: path.join(cogear.config.url,post.uri),
            guid: path.join(cogear.config.url,post.uri),
            categories: post.tags && Array.isArray(post.tags) ? post.tags.map(tag => tag[0].toUpperCase() + tag.slice(1)) : '',
            author: post.author ? post.author.name : config.author,
            date: post.date,
            enclosure: {
              url: img_url,
            }
          });
        });
      }
      const xml = feed.xml({indent: true});
      fs.writeFileSync(path.join(cogear.options.output,'rss.xml'),feed.xml({indent: true}));
      cogear.loader.succeed(`${chalk.yellow('RSS feed')} is written to ${chalk.bold.whiteBright('/rss.xml')}.`);
      cogear.emit('rss.done',config);
    });
  }
};