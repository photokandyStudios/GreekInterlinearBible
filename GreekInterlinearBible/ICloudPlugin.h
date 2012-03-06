//
//  ICloudPlugin.h
//  GreekInterlinearBible
//
//  Created by Kerri Shotts on 3/6/12.
//  Copyright (c) 2012 photoKandy Studios LLC. MIT-license.
//
//
// This plugin is designed to provide very *simple* access to iCloud. It does NOT do anything
// regarding parsing of the data received or written, nor does it do anything about collision
// detection and handling. That's up to /you/.
//
//  Based on large part on http://www.raywenderlich.com/6015/beginning-icloud-in-ios-5-tutorial-part-1

#import <Foundation/Foundation.h>
#ifdef PHONEGAP_FRAMEWORK
#import <PhoneGap/PGPlugin.h>
#else
#import "PGPlugin.h"
#endif

#import "ICloudDocument.h"

@interface ICloudPlugin : PGPlugin {

    // ivars
    NSURL* ubiq;
    NSString* callbackID;
    NSString* filename;
    
}
@property (strong) NSString *callbackID;
@property (strong) ICloudDocument * doc;
@property (strong) NSMetadataQuery *query;
@property (strong) NSString *filename;
/**
 *
 * loadFileFromCloud 
 *
 */
-(void) loadFileFromCloud:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;

-(void) saveFileToCloud:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;

-(void) getContent:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;

-(void) setContent:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;

@end
