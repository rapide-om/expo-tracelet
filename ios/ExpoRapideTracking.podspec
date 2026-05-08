require 'json'

package = JSON.parse(File.read(File.join(__dir__, '..', 'package.json')))

# Tracelet SDK is published to CocoaPods as `TraceletSDK`. Pin to a specific
# minor; bump deliberately after testing on a device.
TRACELET_SDK_VERSION = '~> 1.1'

Pod::Spec.new do |s|
  s.name           = 'ExpoRapideTracking'
  s.version        = package['version']
  s.summary        = package['description']
  s.description    = package['description']
  s.license        = package['license']
  s.author         = package['author']
  s.homepage       = package['homepage']
  s.platforms      = {
    :ios => '15.1'
  }
  s.swift_version  = '5.9'
  s.source         = { git: 'https://github.com/rapide-om/expo-rapide-tracking' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'
  s.dependency 'TraceletSDK', TRACELET_SDK_VERSION

  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
  }

  s.source_files = '**/*.{h,m,mm,swift,hpp,cpp}'
end
