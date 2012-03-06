//
//  ICloudDocument.m
//  GreekInterlinearBible
//
//  Created by Kerri Shotts on 3/6/12.
//  Copyright (c) 2012 photoKandy Studios LLC. MIT license.
//  Based on large part on http://www.raywenderlich.com/6015/beginning-icloud-in-ios-5-tutorial-part-1

#import "ICloudDocument.h"

@implementation ICloudDocument

@synthesize dataContent;

// Called whenever the application reads data from the file system
- (BOOL)loadFromContents:(id)contents ofType:(NSString *)typeName 
  error:(NSError **)outError
{
 
    if ([contents length] > 0) {
        self.dataContent = [[NSString alloc] 
            initWithBytes:[contents bytes] 
            length:[contents length] 
            encoding:NSUTF8StringEncoding];        
    } else {
        // When the note is first created, assign some default content
        self.dataContent = @"Empty"; 
    }

    [[NSNotificationCenter defaultCenter]
        postNotificationName:@"dataModified"
        object:self];

 
    return YES;    
}
 
// Called whenever the application (auto)saves the content of a note
- (id)contentsForType:(NSString *)typeName error:(NSError **)outError 
{
 
    if ([self.dataContent length] == 0) {
        self.dataContent = @"Empty";
    }
 
    return [NSData dataWithBytes:[self.dataContent UTF8String] 
        length:[self.dataContent length]];
 
}


@end
