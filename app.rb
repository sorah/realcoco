require 'sinatra'
require 'yaml'
require 'timeout'
require 'digest/sha1'
require 'json'
require 'thread'
require 'open-uri'

USTREAM_API = "http://api.ustream.tv/json/channel/%s/getEmbedTag"

@yml = Yaml.load_file(File.dirname(__FILE__)+"/config.yml")

Auth.token = @yml[:token]
@ustream = @yml[:ustream] ? (JSON.parse(open(USTREAM_API % @yml[:ustream]))["results"] || "Error") : nil
@justin = @yml[:justin] ? <<EOF : nil
<object type="application/x-shockwave-flash" id="justin" width="320" height="260" data="http://www.justin.tv/widgets/live_embed_player.swf?channel=#{@yml[:justin]}" bgcolor="#000000">
	<param name="allowFullScreen" value="true" />
	<param name="allowscriptaccess" value="always" />
	<param name="allownetworking" value="all" />
	<param name="movie" value="http://www.justin.tv/widgets/live_embed_player.swf" />
	<param name="flashvars" value="channel=#{@yml[:justin]}&auto_play=true&start_volume=25" />
</object>
EOF
 

module Auth
  class << self
    @@token = ""
    @@salts = []

    def token=(x); @@token = x; end
    def token; @@token; end

    def salt
      salt = Digest::SHA1.hexdigest("#{Time.now.to_f}#{rand(1000)}")
      @@salts << Digest::SHA1.hexdigest(salt+@@token)
      salt
    end
    
    def try(hash)
      !(@@salts.find { |salt|
        salt == hash && @@salts.delete(salt)
      }).nil?
    end
  end
end

module Broadcaster
  class << self
    @@queues = []
    @@latest = nil

    def wait
      queue = Queue.new
      @@queues << queue
      var = queue.shift
      @@queues.delete queue
      var 
    end

    def push(x)
      @@latest = x
      @@queues.each do |queue|
        queue << x
      end
    end

    def latest
      @@latest
    end

    alias << push
  end
end

get "/" do
  erb :index
end

get "/salt" do
  content_type :text
  Auth.salt
end

get "/salt.json" do
  content_type :json
  {:salt => Auth.salt}.to_json
end

post "/location" do
  content_type :json
  return {:result => :unauthorized} unless Auth.try(params[:token])
  return {:result => :param} unless params[:latitude] && params[:longitude]
  data = {:latitude  => params[:latitude].to_f,
          :longitude => params[:longitude].to_f,
          :heading   => params[:heading].to_i || -1,
          :speed     => params[:speed] || "-"}
  data.merge!(:address => params[:address]} if params[:address]
  Broadcaster.push data.to_json
  {:result => :success, :salt => Auth.salt}.to_json
end

get "/location" do
  content_type :json
  begin
    timeout(20) do
      Broadcaster.wait
    end
  rescue Timeout::Error
    Broadcaster.latest
  end
end

get "/location/latest" do
  content_type :json
  Broadcaster.latest
end

