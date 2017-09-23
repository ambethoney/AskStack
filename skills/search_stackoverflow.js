const request = require('request');
const VERIFY_TOKEN = process.env.SLACK_VERIFY_TOKEN

function runSearch(controller, bot, message, query, params){
  const baseUrl = 'http://api.stackexchange.com/2.2/search/advanced'
  let options = {
    'method': 'get',
    'gzip': true,
    'content-type': 'application/json',
    'json': true,
    'url': baseUrl + params + query+'&site=stackoverflow'
  }
  request(options, function (error, response, body) {
    let links = '';
    if (!error && response.statusCode == 200) {
      body.items.forEach(query => { links += '<'+query.link+ '|' +query.title+ '> (' +query.answer_count+' answers)\n-----\n'});
      let answers = '```'+links+'```';
      bot.replyPublic(message, answers)
    }
    else if(error) {
      console.log(err);
    }
    else if(response.statusCode == 401) {
      console.log(response.statusCode)
    }
  });
}

module.exports= function(controller){

  controller.hears(['stack overflow', 'coding question'], 'direct_message, mention, ambient', function(bot, message){
    bot.whisper(message, "Hi! It looks like you might have a coding question. If you want me to search Stack Overflow for you, just run `/askstack <your question>` for questions with the highest score. If you'd rather get the most recent questions, type `/askrecent <your question>`. If it's upvotes you're after, use the `/askvotes <your question>` command!");
  })


  controller.on('slash_command', function (bot, message) {

    if (message.token !== VERIFY_TOKEN) {
      return bot.res.send(401, 'Unauthorized')
    }
    switch (message.command) {
      case '/askstack':
        runSearch(controller, bot, message, message.text, '?order=desc&pagesize=10&sort=activity&accepted=True&title=');
        break
      case '/askrecent':
        runSearch(controller, bot, message, message.text, '?order=desc&pagesize=10&title=');
        break
      case '/askvotes':
        runSearch(controller, bot, message, message.text, '?order=desc&pagesize=10&sort=votes&title=');
        break
      default:
        bot.replyPublic(message, "Sorry, I'm not sure what that command is!")
    }
  })

}; //module.export
