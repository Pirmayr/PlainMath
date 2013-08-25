//
//  Test1ViewController.m
//  Test1
//
//  Created by pic on 21.08.13.
//  Copyright (c) 2013 pic. All rights reserved.
//

#import "Test1ViewController.h"

@interface Test1ViewController ()

@end

@implementation Test1ViewController

- (void) viewDidLoad
{
    [super viewDidLoad];
	// Do any additional setup after loading the view, typically from a nib.
    [[_webView scrollView] setBounces: NO];
   
    NSURL *url = [NSURL fileURLWithPath:[[NSBundle mainBundle] pathForResource:@"Web/EasyMath.html" ofType:nil]];
    NSURLRequest *requestObj = [NSURLRequest requestWithURL:url];
    
    [_webView loadRequest:requestObj];
}

- (void) didReceiveMemoryWarning
{
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

- (IBAction) changeGreeting: (id) sender {
}

- (BOOL) webView: (UIWebView *) webView2 shouldStartLoadWithRequest: (NSURLRequest *) request navigationType: (UIWebViewNavigationType) navigationType {
    
    NSString *requestString = [[request URL] absoluteString];
    NSArray *components = [requestString componentsSeparatedByString: @":"];
    if (1 < [components count]) {
        NSString* firstComponent = (NSString *)[components objectAtIndex:0 ];
        if ([firstComponent isEqualToString: @"call"])
        {
            NSString* secondComponent = (NSString *)[components objectAtIndex: 1];
            if ([secondComponent isEqualToString: @"//print"])
            {
                /*
                UIPrintInteractionController *pic = [UIPrintInteractionController sharedPrintController];
                UIPrintInfo *printInfo = [UIPrintInfo printInfo];
                printInfo.outputType = UIPrintInfoOutputGeneral;
                pic.printFormatter = [webView2 viewPrintFormatter];
                pic.showsPageRange = YES;
                
                void (^completionHandler)(UIPrintInteractionController *, BOOL, NSError *) =
                ^(UIPrintInteractionController *printController, BOOL completed, NSError *error)
                {
                    if (!completed && error)
                    {
                        NSLog(@"Printing could not complete because of error: %@", error);
                    }
                };
                [pic presentAnimated:YES completionHandler:completionHandler];
                */
                
                [webView2 stringByEvaluatingJavaScriptFromString: @"sayHello()"];
            }
           return NO;
        }
    }
    return YES; // Return YES to make sure regular navigation works as expected.
}


@end
