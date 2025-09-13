<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StatsRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'start_date' => 'required|date|before_or_equal:end_date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ];
    }

    public function messages()
    {
        return [
            'start_date.required' => 'La date de début est obligatoire',
            'start_date.date' => 'La date de début doit être une date valide',
            'start_date.before_or_equal' => 'La date de début doit être antérieure ou égale à la date de fin',
            'end_date.required' => 'La date de fin est obligatoire',
            'end_date.date' => 'La date de fin doit être une date valide',
            'end_date.after_or_equal' => 'La date de fin doit être postérieure ou égale à la date de début',
        ];
    }
}