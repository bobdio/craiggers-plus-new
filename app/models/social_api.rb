require 'rest_client'

class SocialAPI

  class << self

    def base_url
      ServerConfig.user_api
    end

    # /social/comment

    # @desc
    # Creates a comment

    # @params
    # userID - user id in 3taps
    # postKey - postKey of post to comment on
    # text - text of the comment
    # credit - the name the comment should be attributed to.
    #         could be alias or name in identity.
    # flagTypeID - ID of the flag to be applied to this posting/comment,
    # parentID - the id of the parent comment if this comment is a reply
    def comment(options)
      request('comment', options)
    end

    # /social/comments/[postKey]

    # @desc
    # Get comments associated with a posting.
    # Comments will also be returned via the Posting API when users
    # call /posting/get, but this method may be faster for polled updates.

    # @return
    # An array of Comment objects with the following fields:
    # {
	  #   id: The id of the comment,
    #   text: The text of the comment,
    #   credit: The name the comment should be attributed to
    #   flagTypeID: Flag type ID to be applied to this comment/posting,
    #   parentID: The id of the comment that this comment is replying to,
    #   timestamp: The date and time that the comment was created at
    # }

    def comments(postKey)
      request('comments/' + postKey, {})
    end

    def claimed_postings_get(userID)
      response = request('claims/' + userID.to_s, {})
      ActiveSupport::JSON.decode(response)
    end

    def set_owner(userID, postKey, app)
      response = request('claim?' + "userID=#{userID}&postKey=#{postKey}&app=#{app}", {})
      ActiveSupport::JSON.decode(response)
    end

    def delete_owner(userID, postKey, app)
      response = request('unclaim?' + "userID=#{userID}&postKey=#{postKey}&app=#{app}", {})
      ActiveSupport::JSON.decode(response)
    end

    def messages(userID)
      response = request('messages?' + "userID=#{userID}", {})
      ActiveSupport::JSON.decode(response)
    end


    def message(userID, partnerID, post_key, text)
      hash = {
        'senderID' => userID,
        'recipientID' => partnerID,
        'body' => text,
        'postKey' => post_key
      }
      response = request('message', hash)
      ActiveSupport::JSON.decode(response)
    end

    def request(path, data)
      params = {}
      url = "#{base_url}/social/#{path}"
      ::Rails.logger.error "REQUEST--------------------------------------"
      ::Rails.logger.error "PATH---#{path}"
      data.each{|k, v| ::Rails.logger.error "#{k} => #{v}\n"}
      ::Rails.logger.error "END REQUEST--------------------------------------"
      data.each do |k,v|
        v = JSON.generate(v) if v.is_a?(Hash)
        v = v.to_s if !v.is_a?(File)
        params[k.to_s] = v
      end
      response = RestClient.post(url, params)
    end

  end

end
