ChaiBioTech.Models.Stage = ChaiBioTech.Models.Stage || {};

ChaiBioTech.Models.Stage = Backbone.Model.extend({

  url: "/protocols",

  initialize: function() {
    // Remember sometimes u will have to assign id
  },

  addStage: function(type, protocolId, fabricStageView) {
    that = this;
    var id = this.get("stage").id;
    var dataToBeSend = {
      "prev_id": id,
      "stage": {
        'stage_type': type
      }
    };
    $.ajax({
      url: "/protocols/"+protocolId+"/stages",
      contentType: 'application/json',
      type: 'POST',
      data: JSON.stringify(dataToBeSend)
    })
    .done(function(data) {
      console.log("done added");
      fabricStageView.canvas.fire("modelChanged");
    })
    .fail(function() {
      console.log("Failed to update");
    });
  },

  saveCycle: function(cycle) {
    var that = this;
    var dataToBeSend = {'stage': {'num_cycles': cycle}};
    $.ajax({
        url: "/stages/"+this.get("stage").id,
        contentType: 'application/json',
        type: 'PUT',
        data: JSON.stringify(dataToBeSend)
      })
      .done(function(data) {
          console.log("Data updated from server woohaa" , data);
      })
      .fail(function() {
        console.log("Failed to update");
      });
  }
});
