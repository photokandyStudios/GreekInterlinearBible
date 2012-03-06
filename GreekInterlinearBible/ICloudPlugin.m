//
//  ICloudPlugin.m
//  GreekInterlinearBible
//
//  Created by Kerri Shotts on 3/6/12.
//  Copyright (c) 2012 photoKandy Studios LLC. MIT License.
//
//  Based on large part on http://www.raywenderlich.com/6015/beginning-icloud-in-ios-5-tutorial-part-1

#import "ICloudPlugin.h"

@implementation ICloudPlugin

@synthesize callbackID;
@synthesize doc = _doc;
@synthesize query = _query;
@synthesize filename;

-(void)loadFileFromCloud:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options  
{
    self.callbackID = [arguments pop];
    NSString* jsString;
    PluginResult* result = nil;
    
    self.filename = [options objectForKey:@"filename"];

    self->ubiq = [[NSFileManager defaultManager] 
        URLForUbiquityContainerIdentifier:nil];
      
    if (ubiq)
    {
        // we have iCloud access; now check to see if our filename is there.
        NSMetadataQuery *query = [[NSMetadataQuery alloc] init];
        _query = query;
        [query setSearchScopes:[NSArray arrayWithObject:
            NSMetadataQueryUbiquitousDocumentsScope]];
        NSPredicate *pred = [NSPredicate predicateWithFormat: 
            @"%K == %@", NSMetadataItemFSNameKey, self.filename];
        [query setPredicate:pred];
        [[NSNotificationCenter defaultCenter] 
            addObserver:self 
            selector:@selector(queryDidFinishGathering:) 
            name:NSMetadataQueryDidFinishGatheringNotification 
            object:query];
     
        [query startQuery];        
    }
    else
    {
        // we have no iCloud Access. Fail.
        result = [PluginResult resultWithStatus:PGCommandStatus_NO_RESULT messageAsString:@"No iCloud Access."];
        jsString = [result toErrorCallbackString:callbackID];
    }
    [self writeJavascript:jsString];
}

- (void)dataReloaded:(NSNotification *)notification {
    self.doc = notification.object;
}

- (void)loadData:(NSMetadataQuery *)query {
 
    if ([query resultCount] == 1) {
 
        NSMetadataItem *item = [query resultAtIndex:0];
        NSURL *url = [item valueForAttribute:NSMetadataItemURLKey];
        ICloudDocument *doc = [[ICloudDocument alloc] initWithFileURL:url];
        self.doc = doc;
        [self.doc openWithCompletionHandler:^(BOOL success) {
            if (success) {                
                NSString* jsString;
                PluginResult* result = nil;

                result = [PluginResult resultWithStatus:PGCommandStatus_OK messageAsString:@"iCloud Document successfully Opened."];
                jsString = [result toSuccessCallbackString:callbackID];
                [self writeJavascript:jsString];

                [[NSNotificationCenter defaultCenter] addObserver: self
                    selector:@selector(dataReloaded:)
                    name:@"dataModified" object:nil];
            } else {                

                NSString* jsString;
                PluginResult* result = nil;

                result = [PluginResult resultWithStatus:PGCommandStatus_NO_RESULT messageAsString:@"Could not open iCloud Document."];
                jsString = [result toErrorCallbackString:callbackID];
                [self writeJavascript:jsString];
            }
        }];
	}
    else {
     
        /*NSURL *ubiq = [[NSFileManager defaultManager] 
          URLForUbiquityContainerIdentifier:nil];*/
        NSURL *ubiquitousPackage = [[ubiq URLByAppendingPathComponent:
          @"Documents"] URLByAppendingPathComponent:self.filename];
     
        ICloudDocument *doc = [[ICloudDocument alloc] initWithFileURL:ubiquitousPackage];
        self.doc = doc;
     
        [doc saveToURL:[doc fileURL] 
          forSaveOperation:UIDocumentSaveForCreating 
          completionHandler:^(BOOL success) {            
            if (success) {                
                NSString* jsString;
                PluginResult* result = nil;

                result = [PluginResult resultWithStatus:PGCommandStatus_OK messageAsString:@"New iCloud Document successfully Opened."];
                jsString = [result toSuccessCallbackString:callbackID];
                [self writeJavascript:jsString];
                
                [[NSNotificationCenter defaultCenter] addObserver: self
                    selector:@selector(dataReloaded:)
                    name:@"dataModified" object:nil];
                    
            } else {                

                NSString* jsString;
                PluginResult* result = nil;

                result = [PluginResult resultWithStatus:PGCommandStatus_NO_RESULT messageAsString:@"Could not create iCloud Document."];
                jsString = [result toErrorCallbackString:callbackID];
                [self writeJavascript:jsString];
            }
        }];
    }
}

- (void)queryDidFinishGathering:(NSNotification *)notification {
 
    NSMetadataQuery *query = [notification object];
    [query disableUpdates];
    [query stopQuery];
 
    [[NSNotificationCenter defaultCenter] removeObserver:self 
        name:NSMetadataQueryDidFinishGatheringNotification
        object:query];
 
    _query = nil;
 
	[self loadData:query];
 
}	


-(void)saveFileToCloud:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options  
{
	self.callbackID = [arguments pop];
    NSString* jsString;
    
    self.filename = [options objectForKey:@"filename"];
    PluginResult* result = nil;
    
    self->ubiq = [[NSFileManager defaultManager] 
        URLForUbiquityContainerIdentifier:nil];

    if (ubiq)
    {

        NSURL *ubiquitousPackage = [[ubiq URLByAppendingPathComponent:
          @"Documents"] URLByAppendingPathComponent:self.filename];
        [self.doc saveToURL:ubiquitousPackage
          forSaveOperation:UIDocumentSaveForCreating 
          completionHandler:^(BOOL success) {            
            if (success) {                
                NSString* jsString;
                PluginResult* result = nil;

                result = [PluginResult resultWithStatus:PGCommandStatus_OK messageAsString:@"iCloud Document successfully Saved."];
                jsString = [result toSuccessCallbackString:callbackID];
                [self writeJavascript:jsString];
                
                [[NSNotificationCenter defaultCenter] addObserver: self
                    selector:@selector(dataReloaded:)
                    name:@"dataModified" object:nil];
                    
            } else {                

                NSString* jsString;
                PluginResult* result = nil;

                result = [PluginResult resultWithStatus:PGCommandStatus_NO_RESULT messageAsString:@"Could not save iCloud Document."];
                jsString = [result toErrorCallbackString:callbackID];
                [self writeJavascript:jsString];
            }
        }];


    }
    else
    {
        // we have no iCloud Access. Fail.
        result = [PluginResult resultWithStatus:PGCommandStatus_NO_RESULT messageAsString:@"No iCloud Access."];
        jsString = [result toErrorCallbackString:callbackID];
    }
    [self writeJavascript:jsString];
}	

-(void)getContent:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options  
{
	self.callbackID = [arguments pop];
    NSString* jsString;
    PluginResult* result = nil;
    
    if (ubiq)
    {
        // we have iCloud access. Return the contents of the document.
        result = [PluginResult resultWithStatus:PGCommandStatus_OK messageAsString:self.doc.dataContent];
        jsString = [result toSuccessCallbackString:callbackID];
    }
    else
    {
        // we have no iCloud Access. Fail.
        result = [PluginResult resultWithStatus:PGCommandStatus_NO_RESULT messageAsString:@"No iCloud Access."];
        jsString = [result toErrorCallbackString:callbackID];
    }
    [self writeJavascript:jsString];
    
}	

-(void)setContent:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options  
{
	self.callbackID = [arguments pop];
    NSString* jsString;
    
    NSString* settingsContent = [options objectForKey:@"content"];
    PluginResult* result = nil;
    
    if (ubiq)
    {
        // we have iCloud access. Return the contents of the document.
        self.doc.dataContent = settingsContent;
        [self.doc updateChangeCount:UIDocumentChangeDone];
        result = [PluginResult resultWithStatus:PGCommandStatus_OK messageAsString:@"Content set."];
        jsString = [result toSuccessCallbackString:callbackID];
    }
    else
    {
        // we have no iCloud Access. Fail.
        result = [PluginResult resultWithStatus:PGCommandStatus_NO_RESULT messageAsString:@"No iCloud Access."];
        jsString = [result toErrorCallbackString:callbackID];
    }
    [self writeJavascript:jsString];
       
}	

@end
