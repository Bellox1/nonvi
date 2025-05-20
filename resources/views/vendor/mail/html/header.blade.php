@props(['url'])

<tr>
    <td class="header" style="text-align: center;">
        @if (trim($slot) === 'NONVI_VOYAGE_PLUS')
            @php
                $path = public_path('storage/images/logo.jpg');
                $type = pathinfo($path, PATHINFO_EXTENSION);
                $data = base64_encode(file_get_contents($path));
                $src = "data:image/{$type};base64,{$data}";
            @endphp

            <img src="{{ $src }}" alt="Nonvi Logo" style="width: 170px; height: 170px;">
        @else
            <a href="{{ $url }}" style="display: inline-block;">
                {{ $slot }}
            </a>
        @endif
    </td>
</tr>
