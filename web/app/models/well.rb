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
class Well < ActiveRecord::Base
	include Swagger::Blocks
  belongs_to :experiment

	swagger_schema :Well do
		property :well_num do
			key :description, '1-16'
			key :type, :integer
		end
		property :well_type do
			key :description, 'positive_control, no_template_control, standard, sample'
			key :type, :string
		end
		property :sample_name do
			key :description, 'sample name'
			key :type, :string
		end
		property :notes do
			key :description, 'notes'
			key :type, :string
		end
		property :targets do
			key :type, :array
      key :description, "Array of one or two depending on the channels eg.['channel1 target', 'channel2 target']"
			items do
				key :type, :string
				end
		end
	end

  scope :well, lambda {|experiment_id, well_num| where("experiment_id=? and well_num=?", experiment_id, well_num)}

  validates_presence_of :experiment_id, :well_num, :well_type

  ACCESSIBLE_ATTRS = [:well_num, :well_type, :sample_name, :notes, :target1, :target2]

  def self.create_or_update(params)
    well = self.well(params[:experiment_id], params[:well_num]).first
    if well
      well.update_attributes(params)
      return well
    else
      self.create(params)
    end
  end

  def self.wells(experiment_id)
    wells = []
    self.where("experiment_id=?", experiment_id).each do |well|
      wells[well.well_num] = well
    end
    wells
  end
end