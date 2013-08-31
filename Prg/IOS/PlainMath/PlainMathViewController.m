//
//  PlainMathViewController.m
//  PlainMath
//
//  Created by pic on 25.08.13.
//  Copyright (c) 2013 Pirmayr. All rights reserved.
//

#pragma mark -
#pragma mark UIPrintInteractionControllerDelegate

#import "PlainMathViewController.h"

@interface PlainMathViewController ()

@end

@implementation PlainMathViewController

- (void)viewDidLoad
{
    [super viewDidLoad];
    
	// Do any additional setup after loading the view, typically from a nib.
    [[_webView scrollView] setBounces: NO];
    NSURL *url = [NSURL fileURLWithPath:[[NSBundle mainBundle] pathForResource:@"Web/EasyMath.html" ofType:nil]];
    NSURLRequest *requestObj = [NSURLRequest requestWithURL:url];
    [_webView loadRequest:requestObj];
}

- (void)didReceiveMemoryWarning
{
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
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
                UIPrintInteractionController *pic = [UIPrintInteractionController sharedPrintController];
                UIPrintInfo *printInfo = [UIPrintInfo printInfo];
                printInfo.outputType = UIPrintInfoOutputGeneral;
                pic.printFormatter = [webView2 viewPrintFormatter];
                pic.showsPageRange = YES;
                pic.delegate = self;
                void (^completionHandler)(UIPrintInteractionController *, BOOL, NSError *) =
                ^(UIPrintInteractionController *printController, BOOL completed, NSError *error)
                {
                    if (!completed && error)
                    {
                        NSLog(@"Printing could not complete because of error: %@", error);
                    }
                };
                [pic presentAnimated:YES completionHandler:completionHandler];
            }
            return NO;
        }
    }
    return YES; // Return YES to make sure regular navigation works as expected.
}

-(UIViewController*) printInteractionControllerParentViewController:(UIPrintInteractionController*)printInteractionController
{
	return nil;
}

-(UIPrintPaper*) printInteractionController:(UIPrintInteractionController*)printInteractionController choosePaper:(NSArray*)paperList
{
	return nil;
}

-(void) printInteractionControllerWillPresentPrinterOptions:(UIPrintInteractionController*)printInteractionController
{
}

-(void) printInteractionControllerDidPresentPrinterOptions:(UIPrintInteractionController*)printInteractionController
{
}

-(void) printInteractionControllerWillDismissPrinterOptions:(UIPrintInteractionController*)printInteractionController
{
}

-(void) printInteractionControllerDidDismissPrinterOptions:(UIPrintInteractionController*)printInteractionController
{
}

-(void) printInteractionControllerWillStartJob:(UIPrintInteractionController*)printInteractionController
{
    [_webView stringByEvaluatingJavaScriptFromString: @"printBegin()"];
}

-(void) printInteractionControllerDidFinishJob:(UIPrintInteractionController*)printInteractionController
{
    [_webView stringByEvaluatingJavaScriptFromString: @"printEnd()"];
}

@end
