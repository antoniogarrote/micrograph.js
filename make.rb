#!/usr/bin/env ruby

require 'rubygems'
require 'fileutils'
require 'json'

NODEUNIT = "/Users/antonio/Development/Projects/js/micrograph.js/node_modules/nodeunit/bin/nodeunit"

def load_configuration
  puts "*** loading configuration"
  require(File.dirname(__FILE__)+"/configuration")
end

def build_distribution_directory(system);
  begin
    puts "*** building distribution directory"
    Dir.mkdir "./dist"
    Dir.mkdir "./dist/browser"
    Dir.mkdir "./dist/browser_persistent"    
  rescue 
    puts "(!) dist directory already exits"
    FileUtils.rm_r("./dist/browser/") if system == 'browser' && File.exists?("./dist/browser")
    FileUtils.rm_r("./dist/browser_persistent/")  if system == 'browser_persistent' && File.exists?("./dist/browser_persistent")        
    Dir.mkdir "./dist/browser"            if system == 'browser'
    Dir.mkdir "./dist/browser_persistent" if system == 'browser_persistent'
  end
end

def minimize_output_browser
  puts "*** minimizing output"
  `cp ./closure-compiler.jar ./dist/browser/`
#  `cd ./dist/browser && java -jar closure-compiler.jar --compilation_level=ADVANCED_OPTIMIZATIONS --js=micrograph.js > micrograph_min.js`
  `cd ./dist/browser && java -jar closure-compiler.jar --compilation_level=SIMPLE_OPTIMIZATIONS --js=micrograph.js > micrograph_min.js`
  `cp ./dist/browser/micrograph_min.js ./dist/browser/micrograph_min.js.bak`
  `cd ./dist/browser && gzip -9 micrograph_min.js`
  `mv ./dist/browser/micrograph_min.js.bak ./dist/browser/micrograph_min.js`
  `rm ./dist/browser/closure-compiler.jar`
  `cp ./dist/browser/micrograph*.js ./browsertests/non_persistent/`
  `cp ./dist/browser/micrograph*.js ./browsertests/workers/resources/public/`
end

def minimize_output_n3
  puts "*** minimizing n3"
  `cp ./closure-compiler.jar ./dist/browser/`
  `cp ./src/micrograph/src/n3.js ./dist/browser/`
#  `cd ./dist/browser && java -jar closure-compiler.jar --compilation_level=ADVANCED_OPTIMIZATIONS --js=micrograph.js > micrograph_min.js`
  `cd ./dist/browser && java -jar closure-compiler.jar --compilation_level=SIMPLE_OPTIMIZATIONS --js=n3.js > n3_min.js`
  `cp ./dist/browser/n3_min.js ./dist/browser/n3_min.js.bak`
  `cd ./dist/browser && gzip -9 n3_min.js`
  `mv ./dist/browser/n3_min.js.bak ./dist/browser/n3_min.js`
  `rm ./dist/browser/closure-compiler.jar`
end

def minimize_output_browser_persistent
  puts "*** minimizing output"
  `cp ./closure-compiler.jar ./dist/browser_persistent/`
#  `cd ./dist/browser && java -jar closure-compiler.jar --compilation_level=ADVANCED_OPTIMIZATIONS --js=micrograph.js > micrograph_min.js`
  `cd ./dist/browser_persistent && java -jar closure-compiler.jar --compilation_level=SIMPLE_OPTIMIZATIONS --js=micrograph.js > micrograph_min.js`
  `cp ./dist/browser_persistent/micrograph_min.js ./dist/browser_persistent/micrograph_min.js.bak`
  `cd ./dist/browser_persistent && gzip -9 micrograph_min.js`
  `mv ./dist/browser_persistent/micrograph_min.js.bak ./dist/browser_persistent/micrograph_min.js`
  `rm ./dist/browser_persistent/closure-compiler.jar`
  `cp ./dist/browser_persistent/micrograph*.js ./browsertests/persistent/`
end



def write_browser_preamble(of)
  js_code =<<__END
(function() {\r\n

  if(typeof(console)=='undefined') {
     console = {};
     console.log = function(e){};
  }

__END
  of << js_code
end

def process_file_for_browser(of, f) 
  f.each_line do |line|
    if (line =~ /exports\.[a-zA-Z0-9]+ *= *\{ *\};/) == 0
      puts " * modifying: #{line} -> var #{line.split("exports.")[1]}"
      of << "var #{line.split('exports.')[1]}"
    elsif(line =~ /exports.Micrograph[ =]{1,1}/) === 0
      puts " * ignoring micrograph exports "
    elsif (line =~ /exports.MicrographQuery/) == 0
      puts " * modifying MicrographQuery export"
      of << "var MicrographQuery = function(#{line.split('MicrographQuery = function(')[1]}"
    elsif (line =~/var QueryPlan = require/) == 0
      of << "var QueryPlan = QueryPlanDPSize;"
    elsif (line =~ /var QueryEngine = require/) == 0
      # Replace the line we are ignoring
      of << "var MongodbQueryEngine = { MongodbQueryEngine: function(){ throw 'MongoDB backend not supported in the browser version' } };\n"
    elsif (line =~ /var *([a-zA-Z0-9]+) *= *exports\.\1;/) == 0
      puts " * ignoring: #{line}"
    elsif (line =~ /var *([a-zA-Z0-9]+) *= *require\(['\"]{1,1}[a-zA-Z0-9_\.\/-]*['\"]{1,1}\)\.\1;/) == 0
      puts " * ignoring: #{line}"
    elsif (line =~ /var *([a-zA-Z0-9]+) *= *require\(__dirname\+['\"]{1,1}[a-zA-Z0-9_\.\/-]*['\"]{1,1}\)\.\1;/) == 0
      puts " * ignoring: #{line}"
    elsif (line =~ /var *([a-zA-Z0-9]+) *= *require\(['\"]webworker[\"']\);/)
      puts " * ignoring require for NodeJS WebWorkers: #{line}"  
    elsif (line =~ /var BaseTree *= *require\(['\"]{1,1}[a-zA-Z0-9_\.\/-]*['\"]{1,1}\)\./) == 0
      puts " * writing right MemoryTree"
      tree = line.split(".")[-1];
      of << "var BaseTree = #{tree}"
    else
      # require for YUI compressor
      line.gsub!('dataset.default', "dataset['default']")
      line.gsub!("default:[]","'default':[]")
      line.gsub!("Callbacks.deleted","____TMP_DOT_DELETE____");
      line.gsub!(".delete","['delete']");
      line.gsub!("____TMP_DOT_DELETE____","Callbacks.deleted");
      line.gsub!(".extends","['extends']");
      line.gsub!(".with","['with']");
      line.gsub!(".using","['using']");
      of << line
    end
  end
end

def process_file_for_browser_persistent(of, f) 
  f.each_line do |line|
    if (line =~ /exports\.[a-zA-Z0-9]+ *= *\{ *\};/) == 0
      puts " * modifying: #{line} -> var #{line.split("exports.")[1]}"
      of << "var #{line.split('exports.')[1]}"
    elsif (line =~/var QueryPlan = require/) == 0
      of << "var QueryPlan = QueryPlanDPSize;"
    elsif (line =~ /var QueryEngine = require/) == 0
      # Replace the line we are ignoring
      of << "var MongodbQueryEngine = { MongodbQueryEngine: function(){ throw 'MongoDB backend not supported in the browser version' } };\n"
    elsif (line =~ /var BaseTree *= *require\(['\"]{1,1}[a-zA-Z0-9_\.\/-]*['\"]{1,1}\)\./) == 0
      puts " * writing Persistent Memory Tree"
      of << "var BaseTree = WebLocalStorageBTree;"
    elsif (line =~ /var Lexicon *= *require\(['\"]{1,1}[a-zA-Z0-9_\.\/-]*['\"]{1,1}\)\./) == 0
      puts " * writing Persistent Lexicon"
      of << "var Lexicon = WebLocalStorageLexicon;"
    elsif (line =~ /var *([a-zA-Z0-9]+) *= *exports\.\1;/) == 0
      puts " * ignoring: #{line}"
    elsif (line =~ /var *([a-zA-Z0-9]+) *= *require\(['\"]{1,1}[a-zA-Z0-9_\.\/-]*['\"]{1,1}\)\.\1;/) == 0
      puts " * ignoring: #{line}"
    elsif (line =~ /var *([a-zA-Z0-9]+) *= *require\(__dirname\+['\"]{1,1}[a-zA-Z0-9_\.\/-]*['\"]{1,1}\)\.\1;/) == 0
      puts " * ignoring: #{line}"
    elsif (line =~ /var *([a-zA-Z0-9]+) *= *require\(['\"]webworker[\"']\);/)
      puts " * ignoring require for NodeJS WebWorkers: #{line}"  
    else
      # require for YUI compressor
      line.gsub!('dataset.default', "dataset['default']")
      line.gsub!("default:[]","'default':[]")
      line.gsub!("Callbacks.deleted","____TMP_DOT_DELETE____");
      line.gsub!(".delete","['delete']");
      line.gsub!("____TMP_DOT_DELETE____","Callbacks.deleted");
      line.gsub!(".extends","['extends']");
      line.gsub!(".with","['with']");
      line.gsub!(".using","['using']");
      of << line
    end
  end
end

def write_browser_coda(of)
  js_code =<<__END
try {
  if(typeof(window) === 'undefined')
     exports.create = Micrograph.create;
  else
     window.mg = Micrograph;
} catch(e) { }
})();
__END

  of << js_code;
end

def process_files_for_browser
  File.open("./dist/browser/micrograph.js", "w") do |of|
    
    if BUILD_CONFIGURATION[:browser][:load_jquery]
      File.open("./src/js-communication/src/jquery_ajax.js", "r") do |f|
        f.each_line do |line|
          of << line
        end
      end
    end

    
    write_browser_preamble(of)
    
    BUILD_CONFIGURATION[:browser][:modules].each do |module_file|
      puts "*** processing #{module_file}"
      File.open(module_file, "r") do |f|
        process_file_for_browser(of, f)
        of << "\r\n// end of #{module_file} \r\n"
      end
    end

    write_browser_coda(of)
  end
end

def process_files_for_browser_persistent
  File.open("./dist/browser_persistent/micrograph.js", "w") do |of|

    if BUILD_CONFIGURATION[:browser_persistent][:load_jquery]
      File.open("./src/js-communication/src/jquery_ajax.js", "r") do |f|
        f.each_line do |line|
          of << line
        end
      end
    end

    
    write_browser_preamble(of)
    
    BUILD_CONFIGURATION[:browser_persistent][:modules].each do |module_file|
      puts "*** processing #{module_file}"
      File.open(module_file, "r") do |f|
        process_file_for_browser_persistent(of, f)
        of << "\r\n// end of #{module_file} \r\n"
      end
    end

    write_browser_coda(of)
  end
end

def make_browser
  puts "  BROWSER CONFIGURATION"
  load_configuration
  build_distribution_directory 'browser'
  process_files_for_browser
  minimize_output_browser
  minimize_output_n3
end

def make_browser_persistent
  puts "  BROWSER PERSISTENT CONFIGURATION"
  load_configuration
  build_distribution_directory 'browser_persistent'
  process_files_for_browser_persistent
  minimize_output_browser_persistent
  puts "\r\n*** FINISHED"
end


# build!
make_browser
`tar -cvf mg.tar.gz ./dist/browser/micrograph.js ./dist/browser/micrograph_min.js ./dist/browser/n3.js ./dist/browser/n3_min.js`
puts "\r\n*** FINISHED"
