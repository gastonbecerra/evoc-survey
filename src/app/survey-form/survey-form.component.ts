import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ValidatorFn } from '@angular/forms';
import { SurveyService } from '../survey.service';

interface Validator {
  name: string;
  value?: number;
}

interface SurveyItem {
  var: string;
  type: string;
  question: string;
  options?: string[];
  validators?: Validator[];
  invalid_text?: string; 
  placeholder?: string;
}

interface SurveyData {
  information: {
    name: string;
    introduction: string;
  };
  items: SurveyItem[];
}

@Component({
  selector: 'app-survey-form',
  templateUrl: './survey-form.component.html',
  styleUrls: ['./survey-form.component.css']
})
export class SurveyFormComponent implements OnInit {
  surveyForm: FormGroup = new FormGroup({});
  surveyData!: SurveyData;

  constructor(
    private formBuilder: FormBuilder,
    private surveyService: SurveyService,
  ) {
    this.surveyForm = this.formBuilder.group({});
  }

  ngOnInit(): void {
    this.surveyService.getSurveyData().subscribe(
      (data: SurveyData) => {
        this.surveyData = data;
        console.log(this.surveyData); // Test: Log surveyData.information
        this.createForm();
      },
      (error: any) => {
        console.log('Error loading survey data:', error);
      }
    );
  }

  createForm(): void {
    const formControls: { [key: string]: any } = {};
  
    this.surveyData.items.forEach((item) => {
      const validators: ValidatorFn[] = [];
      let errorMessage: string | undefined;
  
      if (item.validators) {
        item.validators.forEach((validator) => {
          if (validator.name === 'required') {
            validators.push(Validators.required);
          } else if (validator.name === 'min') {
            if (validator.value) {
              validators.push(Validators.min(validator.value));
            }
          } else if (validator.name === 'max') {
            if (validator.value) {
              validators.push(Validators.max(validator.value));
            }
          }
        });
      }
  
      if (item.invalid_text) {
        errorMessage = item.invalid_text;
      }
  
      formControls[item.var] = ['', validators];
      formControls[item.var].errorMessage = errorMessage; // Assign error message to the form control
    });
  
    this.surveyForm = this.formBuilder.group(formControls);
  }
  
  
  onSubmit(): void {
    if (this.surveyForm.valid) {
      console.log(this.surveyForm.value);
    } else {
      console.log('Invalid form');
      console.log(this.surveyForm.errors); // Log the form errors
      console.log(this.surveyForm.controls); // Log the form controls
    }
  }

}