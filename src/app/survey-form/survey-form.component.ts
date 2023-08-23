import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ValidatorFn } from '@angular/forms';
import { SurveyService } from '../survey.service';
import { FormArray } from '@angular/forms';
import { FormControl } from '@angular/forms';
import { AbstractControl } from '@angular/forms';

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
  default_value?: any;
  scale?: ScaleOption[];
  sentences?: Sentence[];
  //evocation?: EvocationItem;
  min_items?: number;
}

interface SurveyData {
  information: {
    name: string;
    introduction: string;
    logo: string;
    team: string;
    mail: string;
  };
  items: SurveyItem[];
}

interface ScaleOption {
  text: string;
  value: number;
}

interface Sentence {
  text: string;
  id: string;
  // meta: {
  //   inverse: boolean;
  //   dimension: string;
  // };
  // **2do: poder incluir meta, o al menos, transferirla a la base
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

  getRange(n: number): number[] {
    return Array.from({ length: n }, (_, i) => i);
  }
  
  additionalWords: number = 0;
  addInput(item: SurveyItem): void {
    const formArray = this.surveyForm.get(item.var) as FormArray;
    formArray.push(new FormControl(''));
    this.additionalWords++;
    console.log('addInput');
  }
      
  getEvocationControl(item: SurveyItem, index: number): FormControl {
    const control = this.surveyForm.get(item.var) as FormArray;
    return control.at(index) as FormControl;
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
  
  updateScaleValue(itemVar: string, sentenceId: string, optionValue: number): void {
    const scaleValues = this.surveyForm.get(itemVar)?.value || {};
    scaleValues[sentenceId] = optionValue;  
    this.surveyForm.patchValue({ [itemVar]: scaleValues });
  }

  createForm(): void {
    const formControls: { [key: string]: any } = {};
  
    this.surveyData.items.forEach((item) => {
      const validators: ValidatorFn[] = [];
      let errorMessage: string | undefined;
  
      // Construir los validadores para el campo actual
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
  
        // Asignar el mensaje de error personalizado si está definido
        if (item.invalid_text) {
          errorMessage = item.invalid_text;
        }
      }
       
      if (item.type === 'evocation' && item.min_items !== undefined) {
        const formArray = this.formBuilder.array([]);
        for (let i = 0; i < item.min_items; i++) {
          formArray.push(this.formBuilder.control(''));
        }
        formControls[item.var] = formArray;

      } else {

        // Definir el valor por defecto del campo
        const defaultValue = item.default_value;
        formControls[item.var] = [defaultValue || '', validators];
  
        // Actualizar el estado y validez del campo si tiene un valor por defecto
        if (defaultValue !== undefined) {
          this.surveyForm.get(item.var)?.updateValueAndValidity();
        }
      }

    });
  
    // Crear el grupo de formularios utilizando los controles definidos
    this.surveyForm = this.formBuilder.group(formControls);
  }

  onSubmit(): void {
  if (this.surveyForm.valid) {
    console.log(this.surveyForm.value);
  } else {
    console.log('Invalid form');
    Object.keys(this.surveyForm.controls).forEach((key) => {
      const controlErrors = this.surveyForm.get(key)?.errors;
      console.log('Control:', key);
      console.log('Errors:', controlErrors);
    });
  }
}

}
