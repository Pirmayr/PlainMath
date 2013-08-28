//
//  PlainMathViewController.h
//  PlainMath
//
//  Created by pic on 25.08.13.
//  Copyright (c) 2013 Pirmayr. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface PlainMathViewController : UIViewController <UIPrintInteractionControllerDelegate>
@property (weak, nonatomic) IBOutlet UIWebView *webView;

@end
