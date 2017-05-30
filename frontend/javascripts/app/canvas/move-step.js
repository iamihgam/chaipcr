/*
 * Chai PCR - Software platform for Open qPCR and Chai's Real-Time PCR instruments.
 * For more information visit http://www.chaibio.com
 *
 * Copyright 2016 Chai Biotechnologies Inc. <info@chaibio.com>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

angular.module("canvasApp").factory('moveStepRect', [
  'ExperimentLoader',
  'previouslySelected',
  'circleManager',
  'StepPositionService',
  'moveStepIndicator',
  function(ExperimentLoader, previouslySelected, circleManager, StepPositionService, moveStepIndicator) {

    return {

      getMoveStepRect: function(me) {
       
        // Things to do, Plan

        // Reduce the size of the clicked stage,
        // Control the movement of the stages in the left and right, according to the shrinke dstage.
        // Control the bordr left of the stage , while step is moving.
        // tag the empty space between stages, Use this space for move step to be a stage.
        // Enable process movement for move-step.
        // Check with move stage , make sure allStepViews are mapped correctly.

        //[
          // Make selected step a different type of step, 
          // Make empty space array, which is to be used for move step to be new stage and move to before first step of the stage,
          // and move after the last step of the stage.
        //]

        // See how a stage with one step works when we click move step
        // enforce move-step boundaries , take care of last stage with infinite hold
        // defrag this file 
        
      this.indicator = new moveStepIndicator(me);
      //this.indicator.verticalLine = verticalLine;
      

      this.indicator.init = function(step, footer, C) {

        this.movement = null;
        this.currentLeft = null;
        this.movedStepIndex = null;
        this.currentMoveRight = null;
        this.rightOffset = 96;
        this.leftOffset = 0;
        this.kanvas = C;
        this.currentDropStage = step.parentStage;
        this.currentDrop = (step.previousStep) ? step.previousStep : null;

        this.spaceArray = [step.parentStage.left - 20, step.parentStage.left + 30];
        this.setVisible(true);
        this.verticalLine.setLeft(footer.left + 41);
        this.verticalLine.setVisible(true);
        C.canvas.bringToFront(this.verticalLine);
        this.setLeft(footer.left);
        this.startPosition = footer.left;
        this.changeText(step);
        StepPositionService.getPositionObject(this.kanvas.allStepViews);
      };

      this.indicator.changeText = function(step) {

        this.temperatureText.setText(step.model.temperature + "º");
        //this.holdTimeText.setText(step.circle.holdTime.text);
        this.indexText.setText(step.numberingTextCurrent.text);
        this.placeText.setText(step.numberingTextCurrent.text + step.numberingTextTotal.text);
      };

      this.indicator.getDirection = function() {

        if(this.movement.left > this.currentLeft && this.direction !== "right") {
              this.direction = "right";
            } else if(this.movement.left < this.currentLeft && this.direction !== "left") {
              this.direction = "left";    
            }
            return this.direction;
      };

      this.indicator.ifOverRightSide = function() {
        this.movedStepIndex = null;

        StepPositionService.allPositions.some(this.ifOverRightSideCallback, this);
        return this.movedStepIndex;
      };

      this.indicator.ifOverRightSideCallback = function(points, index) {

        if((this.movement.left + this.rightOffset) > points[1] && (this.movement.left + this.rightOffset) < points[2]) {
              
          if(index !== this.currentMoveRight) {
            console.log("Found", index);
            this.kanvas.allStepViews[index].moveToSide("left");
            this.currentMoveRight = this.movedStepIndex = index;
            StepPositionService.getPositionObject(this.kanvas.allStepViews);
          }
          return true;
        }
      };
    
      this.indicator.ifOverLeftSide = function() {
        this.movedStepIndex = null;
        StepPositionService.allPositions.some(this.ifOverLeftSideCallback, this);
        return this.movedStepIndex;
      };

      this.indicator.ifOverLeftSideCallback = function(points, index) {

        if((this.movement.left + this.leftOffset) > points[0] && (this.movement.left + this.leftOffset) < points[1]) {
          
          if(this.currentMoveLeft !== index) {
            this.kanvas.allStepViews[index].moveToSide("right");
            this.currentMoveLeft = this.movedStepIndex = index;
            StepPositionService.getPositionObject(this.kanvas.allStepViews);
          }
          return true;
        }
      };

      this.indicator.movedRightAction = function() {

        this.currentMoveLeft = null; // Resetting
        this.currentDrop = this.kanvas.allStepViews[this.movedStepIndex];
        this.currentDropStage = this.currentDrop.parentStage;
        this.manageVerticalLineRight(this.movedStepIndex);
        this.manageBorderLeftForRight(this.movedStepIndex);
      }; 

      this.indicator.movedLeftAction = function() {
        this.currentMoveRight = null; // Resetting
        var step = this.kanvas.allStepViews[this.movedStepIndex];
        if(step.previousStep) {
          this.currentDrop = step.previousStep;
          this.currentDropStage = this.currentDrop.parentStage;
        } else {
          this.currentDrop = null;
          this.currentDropStage = step.parentStage;
        }
        //this.currentDrop = (step.previousStep) ? step.previousStep
        this.manageVerticalLineLeft(this.movedStepIndex);
        this.manageBorderLeftForLeft(this.movedStepIndex);
      }; 

      this.indicator.onTheMove = function(C, movement) {

        this.setLeft(movement.left).setCoords();
        this.movement = movement;
        var direction = this.getDirection();
        this.currentLeft = movement.left;
        
        if(direction === 'right') {
          if(this.ifOverRightSide() !== null) {
            this.movedRightAction();
          } //else if(this.ifOverRightSideForOneStepStage() !== null) {
            //this.movedRightAction();
          //}
        
        } else if(direction === 'left') {
          if(this.ifOverLeftSide() !== null) {
            this.movedLeftAction();
          } //else if(this.ifOverLeftSideForOneStepStage() !== null) {
            //this.movedLeftAction();
         // }
        } 
        
      };

      this.indicator.manageVerticalLineRight = function(index) {

        var place = (this.kanvas.allStepViews[index].left + this.kanvas.allStepViews[index].myWidth - 2);
        this.verticalLine.setLeft(place);
        this.verticalLine.setCoords();
      };

      this.indicator.manageVerticalLineLeft = function(index) {

        var place = (this.kanvas.allStepViews[index].left - 12);
        this.verticalLine.setLeft(place);
        this.verticalLine.setCoords();
      };

      this.indicator.manageBorderLeftForLeft = function(index) {
        
        if(this.kanvas.allStepViews[index + 1]) {
          this.kanvas.allStepViews[index + 1].borderLeft.setVisible(false);
        }
        this.kanvas.allStepViews[index].borderLeft.setVisible(true);
      };

      this.indicator.manageBorderLeftForRight = function(index) {

        if(this.kanvas.allStepViews[index].nextStep) {
          this.kanvas.allStepViews[index + 1].borderLeft.setVisible(true);
        }
        this.kanvas.allStepViews[index].borderLeft.setVisible(false);
      };

      this.indicator.processMovement = function(step, C) {

        this.verticalLine.setVisible(false);
        
        var modelClone = $.extend({}, step.model);
        
        var targetStep = this.currentDrop;

        var targetStage = this.currentDropStage;

        var data = {
          step: modelClone
        };
        this.kanvas.allStageViews[0].moveAllStepsAndStagesSpecial();
        if(targetStep) {
          targetStage.addNewStep(data, targetStep);
        } else {
          targetStep = {
            model: {
              id: null
            }
          };
          targetStage.addNewStepAtTheBeginning(data);
        }
        
        ExperimentLoader.moveStep(modelClone.id, targetStep.model.id, targetStage.model.id)
          .then(function(data) {
            console.log("Moved", data);
          });
          
      };

      return this.indicator;

      },

    };
  }
]
);
