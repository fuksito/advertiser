$(function(){
  
  Backbone.emulateJSON = true;
  // make use of <? and ?> brackets so there would be no collision with erb
  _.templateSettings = {
    interpolate : /<\?=([\s\S]+?)\?>/g,
    escape : /<\?-([\s\S]+?)\?>/g,
    evaluate: /<\?([\s\S]+?)\?>/g
  }
  
  Campaign = Backbone.Model.extend({
    idAttribute: 'id',
    urlRoot: '/campaigns',

    defaults: {
      'title': '',
      'starts_at_date': '',
      'starts_at_time': '',
      'ends_at_date': '',
      'ends_at_time': '',
      'time_zone': 'UTC',
      'data': []
    }
  });

  Country = Backbone.Model.extend({

    defaults: {
      languages: []
    }

  });

  CountryList = Backbone.Collection.extend({
    model: Country
  });

  CampaignList = Backbone.Collection.extend({
    
    model: Campaign,

    url: '/campaigns',

    comparator: function(model) {
      return - model.get("id"); // new one to the top
    }

  });

  Campaigns = new CampaignList;

  
  CampaignView = Backbone.View.extend({

    tagName: 'li',

    template: _.template($('#campaign-template').html()),

    events: {
      'click .edit'    : 'openEdit',
      'click .destroy' : 'clear'
    },

    initialize: function() {
      this.listenTo(this.model, 'change', this.render);
      this.listenTo(this.model, 'destroy', this.remove);
    },

    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      return this;
    },

    openEdit: function(){
      CampaignerApp.navigate('campaigns/' + this.model.id, {trigger: true});
    },

    clear: function(){
      if(confirm('Are you sure to delete campaign "'+ this.model.get('title') +'"')){
        this.model.destroy();
      }
    }

  });

  CampaignFormView = Backbone.View.extend({

    template: _.template($('#campaign-form').html()),

    events: {
      'click .cancel': 'cancel',
      'click .submit': 'submit',
      'focus input' : 'clearErrorsHint'
    },

    initialize: function(){
      
    },

    render: function(){

      this.$el.html(this.template(this.model.toJSON()));

      this.assign_calendars();

      this.countriesTable = new CountriesTable($('#countries_table', this.$el), this.model.get('data') );
      this.countriesTable.render();

      return this;
    },

    cancel: function(){
      if(this.model.isNew()){
        Campaigns.remove(this.model);
      }
      CampaignerApp.navigate('', {trigger: true});
    },

    submit: function(){

      $(".err_msg", this.$el).each(function(i, err_msg){
        $(err_msg).empty();
      });

      _.map( $("#campaign_form", this.$el).serializeArray(), function(input_obj){ 
        this.model.set(input_obj.name, input_obj.value);
      }, this);

      this.model.set('data', this.countriesTable.countryList.toJSON() );

      this.disableSubmit();
      var this_template = this;
      this.model.save({}, {
        
        success: function(model, response, options){
          if (typeof(model.get('data')) == 'string') {
            model.set('data', JSON.parse(model.get('data')));
          }
          Campaigns.add(model);
          CampaignerApp.navigate('', {trigger: true});
        },

        error: function(model, xhr, options){
            this_template.enableSubmit();
            var errors_hash = JSON.parse(xhr.responseText);
            _.each(errors_hash, function(message, input_name){
              $("input[name='"+ input_name +"']", this.el).addClass('has_error');
              $("#"+ input_name +"_err_msg", this.el).html(message);
            });
        }
      })
    },

    assign_calendars: function(){
      $( ".datepicker", this.$el ).datepicker({
          showOn: "button",
          buttonImage: "/images/calendar.gif",
          buttonImageOnly: true,
          dateFormat: "yy-mm-dd"
      });
    },

    clearErrorsHint: function(obj){
      var input_name = $(obj.currentTarget).attr('name');
      $("input[name='"+ input_name +"']", this.el).removeClass('has_error');
      $("#"+ input_name +"_err_msg", this.el).empty();
    },

    disableSubmit: function(){
      this.initialSubmitText = $(".submit", this.$el).text();
      $(".submit", this.$el).addClass('disabled').text('Sending ...');
    },

    enableSubmit: function(){
      $(".submit", this.$el).removeClass('disabled').html(this.initialSubmitText);
    }

  });

  GridView = Backbone.View.extend({

    template: _.template($('#grid-template').html()),

    events: {
      'click .add_campaign': 'openAddCampaign',
    },

    initialize: function() {
      Campaigns.on('add', this.addOne, this);
      Campaigns.on('reset', this.addAll, this);
      Campaigns.on('all', this.updateCounter, this);

      this.$el.html(this.template({}));
    },

    render: function(){
      $("#campaign_list", this.$el).empty();
      this.updateCounter();
      this.addAll();
      return this;
    },

    addOne: function(campaign){
      var view = new CampaignView({model: campaign});
      $("#campaign_list", this.$el).append(view.render().el);
    },

    addAll: function(){
      Campaigns.each(this.addOne, this);
    },

    openAddCampaign: function(){
      CampaignerApp.navigate('campaigns/new', {trigger: true});
    },

    updateCounter: function(){

      if (Campaigns.length > 0){
        var ending = Campaigns.length == 1 ? " campaign" : " campaigns";
        var countries_count = _.reduce(_.map(Campaigns.pluck('data'), function(e){ return e.length }), function(a,b){ return a + b; }, 0);
        var countries_ending = countries_count == 1 ? " country" : " countries"
        $(".counter", this.$el).html("Total: " + Campaigns.length + ending + " in " + countries_count + countries_ending);
      } else {
        $(".counter", this.$el).html("There is no campaigns created yet");
      }
    }

  });


  CountriesTable = Backbone.View.extend({

    events: {
      'click .add_country': 'submitAddCountry',
      "keypress .new_country_name"  : "updateOnEnter"
    },
    
    initialize: function(put_into, rawList){
      this.$el = put_into;
      this.rawList = rawList;
      this.countryList = new CountryList;
      this.countryList.reset(rawList);
      
      this.countryList.on('reset', this.render, this);
      this.countryList.on('add', this.render, this);
    },

    render: function(){
      
      $("tbody", this.$el).empty();
      
      if (this.countryList.length > 0){
        this.countryList.each(this.addOneCountry, this);
      } else {
        $("tbody", this.$el).append('<tr><th colspan="2">No countries specified</th></tr>');
      }

      $( "#new_country_name", this.$el ).autocomplete({
        source: availableCountries
      });

      return this;
    },

    addOneCountry: function(model){
      var td = new CountryTd({model: model});
      $('tbody', this.$el).append(td.render().el);
      $('tbody td input:last', this.$el).focus();
      this.assignAutocompleLanguages($('tbody td input:last', this.$el));
    },

    submitAddCountry: function(){
      var name = $("#new_country_name", this.$el).val();
      this.countryList.add({title: name});
      $("#new_country_name", this.$el).val('')
    },


   updateOnEnter: function(e) {
      if (e.keyCode == 13) this.submitAddCountry();
    },

    assignAutocompleLanguages: function(jquery_element){
        
        jquery_element.bind( "keydown", function( event ) { 
                // don't navigate away from the field on tab when selecting an item
                if ( event.keyCode === $.ui.keyCode.TAB && $( this ).data( "autocomplete" ).menu.active ) {
                    event.preventDefault();
                }
            })
            .autocomplete({
                minLength: 0,
                source: function( request, response ) {
                    // delegate back to autocomplete, but extract the last term
                    response( $.ui.autocomplete.filter(availableLanguages, request.term.split( /,\s*/ ).pop() ) );
                },
                focus: function() {
                    // prevent value inserted on focus
                    return false;
                },
                select: function( event, ui ) {
                    var terms = this.value.split( /,\s*/ );
                    // remove the current input
                    terms.pop();
                    // add the selected item
                    terms.push( ui.item.value );
                    // add placeholder to get the comma-and-space at the end
                    terms.push( "" );
                    this.value = terms.join( ", " );
                    return false;
                }
            })
    }

  });

  CountryTd = Backbone.View.extend({
    
    tagName: 'tr',
    template: _.template($('#country-td-template').html()),

    events: {
      'keyup .languages': 'saveLanguagesString'
    },

    render: function(){
      this.$el.html(this.template(this.model.toJSON()));
      return this;
    },


    saveLanguagesString: function(){
      var languages_array = _.compact( $('.languages input', this.$el).val().split(',') );
      this.model.set('languages',  languages_array );
    }

  })



  CampaignerApp = new (Backbone.Router.extend({
    routes: {
      ''              : 'index',
      'campaigns/new' : 'new_campaign',
      'campaigns/:id' : 'edit_campaign',
    },

    initialize: function(){

    },

    index: function(){
      gridView = new GridView;
      gridView.addAll();
      gridView.render();
      $("#content").html(gridView.el);
    },

    new_campaign: function(){
      model = new Campaign;
      var add_form = new CampaignFormView({model: model});
      add_form.render();
      $("#content").html(add_form.el);
      $("input[name='title']").focus();
    },

    edit_campaign: function(campaign_id){
      var model = Campaigns.get(campaign_id);
      var add_form = new CampaignFormView({model: model});
      add_form.render();
      $("#content").html(add_form.el);
    },

    start: function(campaigns){
      Campaigns.reset(campaigns);
      Backbone.history.start({pushState: true});
    }
  }));
  
  CampaignerApp.start(campaigns_json);
});