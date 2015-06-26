class Posting < ActiveRecord::Base
  after_create :set_external_url
  
  UPLOADABLE_FILESIZE = 1.megabyte
  TOTAL_SIZE = 10.megabytes

  AMAZON_SITE = 'http://s3.amazonaws.com/'
  AMAZON_BUCKET = '3taps_storage'

  serialize :annotations
  belongs_to :location
  validates :source, :account_id, :username, :category, :heading, :body, :location_id, presence: true
  attr_accessor :location_code

  default_scope order('created_at DESC')

  def timestamp
    (actual_date || created_at).to_time.to_i
  end

  def images
    Utils::JsonParser.new(read_attribute(:images)).parse
  end

  def annotations
    read_attribute(:annotations) || []
  end

  private

  def set_external_url
    self.external_url = self.external_url+"#!/search/all/all/all//localPostKey=#{self.id}"
    self.save
  end







  def validate_source(source)
    "Source should have one from next values: INDEE, EBAYC, BKPGE, CRAIG, KIJIJ, JBOOM" unless %w(INDEE EBAYC BKPGE CRAIG KIJIJ JBOOM).include? source
  end

  def validate_category(category)
    "Category should have a correct value (e.g. AAAA, AOTH, APET, ZZZZ, ...)" unless %w(AAAA AOTH APET ASUP CCCC CCNW CGRP CLNF COMM COTH CRID CVOL DDEL DISP DTAX DTOW JACC JADM JAER JANA JANL JARC JART JAUT JBEA JBIZ JCON JCST JCUS JDES JEDU JENE JENG JENT JEVE JFIN JFNB JGIG JGOV JHEA JHOS JHUM JINS JINT JJJJ JLAW JLEG JMAN JMAR JMFT JMNT JNON JOPS JOTH JPHA JPRO JPUR JQUA JREA JREC JRES JRNW JSAL JSCI JSEC JSKL JTEL JTRA JVOL JWEB JWNP MESC MFET MJOB MMMM MMSG MOTH MPNW MSTR PMSM PMSW POTH PPPP PWSM PWSW RCRE RHFR RHFS RLOT ROTH RPNS RRRR RSHR RSUB RSWP RVAC RWNT SANC SANT SAPL SAPP SBAR SBIK SBIZ SCOL SEDU SELE SFNB SFUR SGAR SGFT SHNB SHNG SIND SJWL SKID SLIT SMNM SMUS SOTH SRES SSNF SSSS STIX STOO STOY STVL SVCC SVCE SVCF SVCH SVCM SVCO SVCP SVCS SWNT VAUT VOTH VPAR VVVV ZOTH ZZZZ).include? category
  end

  def validate_latitude(latitude)
    parsed_latitude = Float(latitude) rescue "Latitude should be a number"
    return "Latitude should be present" unless parsed_latitude
    "Longitude should be in the range '-90..90'" unless parsed_latitude >= -90 && parsed_latitude <= 90
  end

  def validate_longitude(longitude)
    parsed_longitude = Float(longitude) rescue "Longitude should be a number"
    return "Longitude should be present" unless parsed_longitude
    "Longitude should be in the range '-180..180'" unless parsed_longitude >= -180 && parsed_longitude <= 180
  end

  def validate_accuracy(accuracy)
    Integer(accuracy) rescue return "Accuracy should be an integer number"
    return true
  end

  def validate_external_id(external_id)
    "External id should be present" unless external_id.present?
  end

  def validate_timestamp(timestamp)
    Time.at(Integer(timestamp)) rescue return "Timestamp attribute should be an integer number"
    return true
  end

  def validate_expires(expires)
    Time.at(Integer(expires)) rescue return "Expires attribute should be an integer number"
    return true
  end

  def validate_language(language)
    "Language should have only 2 word character (letter, number or underscore)" unless language =~ /\w{2}/i
  end

  def validate_price(price)
    Float(price) rescue return "Price should be a number"
    return true
  end

  def validate_currency(currency)
    "Currency should have only 3 word character (letter, number or underscore)" and return currency =~ /\w{3}/i
  end

  def validate_annotations(annotations)
    annotations.each do |attribute, value|
      return "Annotation should be a string" if !value.is_a String
    end
  end

  def validate_status(status)
    "Status should have one from next values: offered, wanted, lost, stolen, found" unless %w(offered wanted lost stolen found).include? status
  end

  def validate_boolean(attribute)
    "This attribute should have boolean value" unless attribute == 'true' || attribute == 'false'
  end
end
