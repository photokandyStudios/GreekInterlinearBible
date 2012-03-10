//
//  PGDefinition.h
//  iOS Definition plugin for PhoneGap
//
//  Author Kerri Shotts. MIT license.
//

#import <Foundation/Foundation.h>
#ifdef PHONEGAP_FRAMEWORK
#import <PhoneGap/PGPlugin.h>
#import <PhoneGap/PluginResult.h>
#else
#import "PGPlugin.h"
#import "PluginResult.h"
#endif
#import "PGDefinition.h"

#ifdef PHONEGAP_FRAMEWORK
	#import <PhoneGap/PhoneGapViewController.h>
#else
	#import "PhoneGapViewController.h"
#endif

@implementation PGDefinition

-(void)showDefinition:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options {
// from http://iphonedevelopertips.com/core-services/ios-5-look-up-definitions-using-dictionary-service.html
// with portions from the childBrowser plugin.
	NSString     *text       = [arguments objectAtIndex:0];
    PhoneGapViewController* cont = (PhoneGapViewController*)[ super appViewController ];

    UIReferenceLibraryViewController *reference = 
      [[UIReferenceLibraryViewController alloc] initWithTerm:text];

    if ([cont respondsToSelector:@selector(presentViewController)]) {
        //Reference UIViewController.h Line:179 for update to iOS 5 difference - @RandyMcMillan
        [cont presentViewController:reference animated:YES completion:nil];        
    } else {
        [ cont presentModalViewController:reference animated:YES ];
    }       
     
	
}

@end
