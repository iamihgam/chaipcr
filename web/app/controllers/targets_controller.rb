#
# Chai PCR - Software platform for Open qPCR and Chai's Real-Time PCR instruments.
# For more information visit http://www.chaibio.com
#
# Copyright 2016 Chai Biotechnologies Inc. <info@chaibio.com>
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
class TargetsController < ApplicationController
  include ParamsHelper
  
  before_filter :ensure_authenticated_user
  before_filter :allow_cors
  
  before_filter -> { well_layout_editable_check }
  before_filter :get_object, :except => [:index, :create]
  
  def index
    @targets = Target.includes(:targets_wells).where(["targets.well_layout_id=? or targets.well_layout_id=?", @experiment.well_layout.id, @experiment.targets_well_layout_id]).order("targets.well_layout_id, targets.id")
    if params[:channel]
      @targets.where(["channel=?", params[:channel]])
    end    
    targets_ids = @targets.map {|target| target.id}
    @targets_wells = TargetsWell.where(["well_layout_id=? AND target_id IN (?)", @experiment.well_layout.id, targets_ids]).order("FIELD(target_id,#{targets_ids.join(',')})")
    target_well_index = 0
    @targets.each do |target|
      #set imported
      if target.well_layout_id != @experiment.well_layout.id
        target.imported = true
      else
        target.imported = false
      end
      #set targets_wells
      targets_wells = []
      while target_well_index < @targets_wells.length && @targets_wells[target_well_index].target_id == target.id
        targets_wells << @targets_wells[target_well_index]
        target_well_index += 1
      end
      target.targets_wells = targets_wells
    end
    respond_to do |format|
      format.json { render "index", :status => :ok}
    end
  end

  def create
    @target = Target.new(target_params)
    @target.well_layout_id = @experiment.well_layout.id
    ret = @target.save
    respond_to do |format|
      format.json { render "show", :status => (ret)? :ok : :unprocessable_entity}
    end
  end
  
  def update
    if @target.well_layout_id == @experiment.well_layout.id
      ret  = @target.update_attributes(target_params)
    else
      @target.errors.add(:base, "target cannot be updated because it is imported")
    end
    respond_to do |format|
      format.json { render "show", :status => (ret)? :ok : :unprocessable_entity}
    end
  end

  def destroy
    if @target.well_layout_id == @experiment.well_layout.id
      @target.force_destroy = (params["force"] == true || params["force"] == "true")? true : false
      begin
        ret = @target.destroy
      rescue  => e
        ret = false
      end
    else
      @target.errors.add(:base, "target cannot be destroyed because it is imported")
    end
    respond_to do |format|
      format.json { render "destroy", :status => (ret)? :ok : :unprocessable_entity}
    end
  end

  def links
    if @target.belongs_to_experiment?(@experiment)
      params[:wells].each do |well|
        if well.is_a? Integer
          link_well(well, nil)
        else
          link_well(well[:well_num], well)
        end
      end
      CachedStandardCurveDatum.invalidate(@experiment.well_layout.id) if @target.errors.empty?
    else
      @target.errors.add(:base, "target doesn't belong to this experiment")
    end
      
    respond_to do |format|
      format.json { render "show", :status => (@target.errors.empty?)? :ok : :unprocessable_entity}
    end
  end
  
  def unlinks
    params[:wells].each do |well_num|
      unlink_well(well_num)
    end
    CachedStandardCurveDatum.invalidate(@experiment.well_layout.id) if @target.errors.empty?
    respond_to do |format|
      format.json { render "show", :status => (@target.errors.empty?)? :ok : :unprocessable_entity}
    end
  end
  
  protected
  
  def link_well(well_num, target_well_params)
    target_well = TargetsWell.find_or_create(@target, @experiment.well_layout.id, well_num)
    if target_well_params
      unless target_well_params[:well_type] == ''
        target_well.well_type = target_well_params[:well_type] if !target_well_params[:well_type].nil?
        target_well.omit = target_well_params[:omit] if !target_well_params[:omit].nil?
        if !target_well_params[:quantity].nil?
          target_well.quantity_m = target_well_params[:quantity][:m]
          target_well.quantity_b = target_well_params[:quantity][:b]
        end
      else
        target_well.well_type = nil
        target_well.omit = nil
        target_well.quantity_m = nil
        target_well.quantity_b = nil
      end
    end
    ret = target_well.save
    if !ret
      target_well.errors.full_messages.each do |message|
        @target.errors.add(:targets_wells, message)
      end
    end
  end
  
  def unlink_well(well_num)
    target_well = TargetsWell.where(:target_id=>@target.id, :well_layout_id=>@experiment.well_layout.id, :well_num=>well_num).first
    if target_well
      ret = target_well.destroy
      if !ret
        target_well.errors.full_messages.each do |message|
          @target.errors.add(:targets_wells, message)
        end
      end
    else
      @target.errors.add(:targets_wells, "well num #{well_num} is not associated with this target")
    end
  end
  
  def get_object
    @target = Target.find_by_id(params[:id])
    if @target == nil
      render json: {errors: "The object doesn't exist"}, status: :unprocessable_entity
      return false
    else
      return true
    end
  end
  
end
