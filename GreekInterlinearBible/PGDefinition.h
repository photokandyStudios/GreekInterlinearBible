//
//  PGDefinition.h
//  iOS Definition plugin for PhoneGap
//
//  Author Kerri Shotts. MIT license.
//

#import <Foundation/Foundation.h>
#ifdef PHONEGAP_FRAMEWORK
#import <PhoneGap/PGPlugin.h>
#else
#import "PGPlugin.h"
#endif

@interface PGDefinition : PGPlugin{ }

-(void)showDefinition:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;

@end
