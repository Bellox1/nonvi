<x-mail::message>
@if (! empty($greeting))
# {{ $greeting }}
@else
@if ($level === 'error')
# @lang('Whoops!')
@else
# @lang('Bonjour !')
@endif
@endif

@foreach ($introLines as $line)
{{ $line }}
@endforeach

@isset($actionText)
<?php
    $color = match ($level) {
        'success', 'error' => $level,
        default => 'primary',
    };
?>
<x-mail::button :url="$actionUrl" :color="$color">{{ $actionText }}</x-mail::button>
@endisset

@foreach ($outroLines as $line)
{{ $line }}
@endforeach

@if (! empty($salutation))
{{ $salutation }}
@else
@lang('Cordialement'),<br>{{ config('app.name') }}
@endif

@isset($actionText)
<x-slot:subcopy>
@lang(
    "Si vous avez des difficultés à cliquer sur le bouton \":actionText\", copiez et collez l’URL ci-dessous\n".
    "dans votre navigateur web :", ['actionText' => $actionText]
)
<span class="break-all">[{{ $displayableActionUrl }}]({{ $actionUrl }})</span>
</x-slot:subcopy>
@endisset
</x-mail::message>
