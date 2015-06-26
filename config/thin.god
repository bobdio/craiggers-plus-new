require 'tlsmail'

THIN_CONFIG = "/home/craiggers-prod/current/config/thin.yml"

config = YAML.load_file(THIN_CONFIG)

num_servers = config["servers"] ||= 1

(0...num_servers).each do |i|
  number = config['socket'] ? i : (config['port'] + i)

  God.watch do |w|
    w.name = "craiggers-#{number}"
    w.group = "production"
  
    w.interval = 30.seconds
  
    w.start = "thin -C #{THIN_CONFIG} -o #{number} start"
    w.start_grace = 10.seconds
  
    w.stop = "thin -C #{THIN_CONFIG} -o #{number} stop"
    w.stop_grace = 10.seconds
  
    w.restart = "thin restart -C #{THIN_CONFIG} -o #{number}"

    pid_path = config["pid"]
    ext = File.extname(pid_path)

    w.pid_file = pid_path.gsub(/#{ext}$/, ".#{number}#{ext}")
  
    w.behavior(:clean_pid_file)

    w.start_if do |start|
      start.condition(:process_running) do |c|
        c.interval = 5.seconds
        c.running = false
        c.notify = 'developers'
      end
    end

    w.restart_if do |restart|
      restart.condition(:memory_usage) do |c|
        c.above = 150.megabytes
        c.times = [3,5] # 3 out of 5 intervals
        c.notify = 'developers'
      end

      restart.condition(:cpu_usage) do |c|
        c.above = 50.percent
        c.times = 5
        c.notify = 'developers'
      end
    end

    w.lifecycle do |on|
      on.condition(:flapping) do |c|
        c.to_state = [:start, :restart]
        c.times = 5
        c.within = 5.minutes
        c.transition = :unmonitored
        c.retry_in = 10.minutes
        c.retry_times = 5
        c.retry_within = 2.hours
        c.notify = 'developers'
      end
    end
  
    w.transition(:up, :start) do |on|
      on.condition(:process_exits) do |c|
        c.notify = 'developers'
      end
    end
  
  end  
end

# now load classic
THIN_CONFIG = "/home/craiggers-prod/current/config/thin-classic.yml"

config = YAML.load_file(THIN_CONFIG)

num_servers = config["servers"] ||= 1

(0...num_servers).each do |i|
  number = config['socket'] ? i : (config['port'] + i)

  God.watch do |w|
    w.name = "craiggers-#{number}"
    w.group = "classic"
  
    w.interval = 30.seconds
  
    w.start = "thin -C #{THIN_CONFIG} -o #{number} start"
    w.start_grace = 10.seconds
  
    w.stop = "thin -C #{THIN_CONFIG} -o #{number} stop"
    w.stop_grace = 10.seconds
  
    w.restart = "thin restart -C #{THIN_CONFIG} -o #{number}"

    pid_path = config["pid"]
    ext = File.extname(pid_path)

    w.pid_file = pid_path.gsub(/#{ext}$/, ".#{number}#{ext}")
  
    w.behavior(:clean_pid_file)

    w.start_if do |start|
      start.condition(:process_running) do |c|
        c.interval = 5.seconds
        c.running = false
        c.notify = 'developers'
      end
    end

    w.restart_if do |restart|
      restart.condition(:memory_usage) do |c|
        c.above = 150.megabytes
        c.times = [3,5] # 3 out of 5 intervals
        c.notify = 'developers'
      end

      restart.condition(:cpu_usage) do |c|
        c.above = 50.percent
        c.times = 5
        c.notify = 'developers'
      end
    end

    w.lifecycle do |on|
      on.condition(:flapping) do |c|
        c.to_state = [:start, :restart]
        c.times = 5
        c.within = 5.minutes
        c.transition = :unmonitored
        c.retry_in = 10.minutes
        c.retry_times = 5
        c.retry_within = 2.hours
        c.notify = 'developers'
      end
    end
  
    w.transition(:up, :start) do |on|
      on.condition(:process_exits) do |c|
        c.notify = 'developers'
      end
    end
  
  end  
end


Net::SMTP.enable_tls(OpenSSL::SSL::VERIFY_NONE)

God::Contacts::Email.defaults do |d|
  d.from_email = 'god@craiggers.com'
  d.from_name = 'god'
  d.delivery_method = :smtp
  d.server_host = 'smtp.gmail.com'
  d.server_port = 587
  d.server_auth = :login
  d.server_domain = 'craiggers.com'
  d.server_user = 'craiggers.mail'
  d.server_password = 'cr4!ggers'
end

God.contact(:email) do |c|
  c.name = 'Mike'
  c.group = 'developers'
  c.to_email = 'michael.betten@gmail.com'
end

God.contact(:email) do |c|
  c.name = 'Devin'
  c.group = 'developers'
  c.to_email = 'dfoley@3taps.com'
end
